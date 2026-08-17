// One-click "add to my chosen playlist" for YouTube.
// Injects a menu item into every video's 3-dot popup menu, then adds the video
// directly via YouTube's internal InnerTube API (same-origin fetch) — no dialog
// automation, no scrolling, no clicking through the native "Save" flow.

const STORAGE_NAME_KEY = 'targetPlaylistName';
const STORAGE_ID_KEY = 'targetPlaylistId';
const MENU_ITEM_CLASS = 'yt-private-watch-later-item';
const MENU_ITEM_ID = 'yt-private-watch-later-item';
const MAX_PLAYLISTS = 500;

// The video id of the menu most recently opened from a video context.
let pendingVideoId = null;
let pendingPlaylistLabel = '';

// ---------------------------------------------------------------------------
// Video id capture: every 3-dot (and other menu) button click inside a video
// renderer records that video's id so the menu we inject into knows what to add.
// ---------------------------------------------------------------------------
document.addEventListener('click', (e) => {
    const button = e.target.closest('button, yt-icon-button');
    if (!button) return;

    const videoEl = button.closest('[data-video-id]');
    if (videoEl) {
        pendingVideoId = videoEl.getAttribute('data-video-id');
        return;
    }

    // Watch-page main menu lives inside ytd-watch-metadata / the player region.
    if (location.pathname === '/watch' && button.closest('ytd-watch-metadata, ytd-player, #movie_player')) {
        pendingVideoId = new URLSearchParams(location.search).get('v');
        return;
    }

    // No video context — clear any stale id so we don't inject into unrelated menus.
    pendingVideoId = null;
}, true);

// ---------------------------------------------------------------------------
// Menu injection
// ---------------------------------------------------------------------------
let injectScheduled = false;
function scheduleInject() {
    if (injectScheduled) return;
    injectScheduled = true;
    setTimeout(() => { injectScheduled = false; injectIntoOpenMenus(); }, 100);
    setTimeout(() => { injectScheduled = false; injectIntoOpenMenus(); }, 400);
}

const injectedMenus = new WeakSet();

function injectIntoOpenMenus() {
    // Only touch menus when we know the video this menu belongs to.
    if (!pendingVideoId) return;

    document.querySelectorAll('ytd-menu-popup-renderer').forEach((menu) => {
        if (injectedMenus.has(menu)) return;

        // New (Lit) menus use yt-list-view-model; legacy menus use tp-yt-paper-listbox.
        const litList = menu.querySelector('yt-list-view-model');
        const legacyList = menu.querySelector('tp-yt-paper-listbox');

        const target = litList || legacyList;
        if (!target) return;

        injectedMenus.add(menu);
        injectItem(target, menu);
    });
}

async function injectItem(list, menuRoot) {
    const item = document.createElement(list.tagName === 'YT-LIST-VIEW-MODEL'
        ? 'yt-list-item-view-model'
        : 'div');
    item.id = MENU_ITEM_ID;
    item.classList.add(MENU_ITEM_CLASS);

    // New (Lit) item: clone structure from an existing item so it renders correctly.
    if (list.tagName === 'YT-LIST-VIEW-MODEL') {
        const existing = list.querySelector('yt-list-item-view-model');
        if (!existing) return;
        const clone = existing.cloneNode(true);
        clone.id = MENU_ITEM_ID;
        clone.classList.add(MENU_ITEM_CLASS);
        const titleEl = clone.querySelector('.yt-list-item-view-model__title');
        if (titleEl) titleEl.textContent = await menuLabel();
        clone.addEventListener('click', (e) => handleClick(e, list, menuRoot));
        list.prepend(clone);
        return;
    }

    // Legacy item: plain row styled by styles.css.
    const title = await menuLabel();
    const span = document.createElement('span');
    span.textContent = title;
    item.appendChild(span);
    item.addEventListener('click', (e) => handleClick(e, list, menuRoot));
    list.prepend(item);
}

async function menuLabel() {
    const { name } = await getTarget();
    return name ? `Add to ${name}` : 'Add to my playlist';
}

function handleClick(e, list, menuRoot) {
    e.preventDefault();
    e.stopPropagation();

    const videoId = pendingVideoId;
    if (!videoId) {
        showToast('Could not determine video ID', true);
        closeMenu(menuRoot);
        return;
    }

    addToPlaylist(videoId)
        .then(() => {
            showToast('Added to playlist');
            closeMenu(menuRoot);
        })
        .catch((err) => {
            showToast(err.message, true);
            closeMenu(menuRoot);
        });
}

function closeMenu(menuRoot) {
    const popup = menuRoot.closest('tp-yt-iron-dropdown') || menuRoot;
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    // Some menu versions need a second nudge.
    setTimeout(() => {
        document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    }, 50);
}

// ---------------------------------------------------------------------------
// Storage helpers
// ---------------------------------------------------------------------------
function getTarget() {
    return new Promise((resolve) => {
        chrome.storage.local.get(
            { [STORAGE_NAME_KEY]: '', [STORAGE_ID_KEY]: '' },
            (items) => resolve({ name: items[STORAGE_NAME_KEY], id: items[STORAGE_ID_KEY] }),
        );
    });
}

// ---------------------------------------------------------------------------
// InnerTube API
// ---------------------------------------------------------------------------
function getInnerTubeConfig() {
    const cfg = window.ytcfg?.data_ || {};
    const apiKey = cfg.INNERTUBE_API_KEY;
    const context = cfg.INNERTUBE_CONTEXT;
    if (!apiKey || !context) throw new Error('YouTube config not ready — reload the page');
    return { apiKey, context };
}

async function innerTubeCall(endpoint, body) {
    const { apiKey, context } = getInnerTubeConfig();
    const res = await fetch(`/youtubei/v1/${endpoint}?key=${apiKey}&prettyPrint=false`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context, ...body }),
    });
    if (!res.ok) throw new Error(`YouTube API error (${res.status})`);
    return res.json();
}

// Resolve the configured playlist (by stored id, else by name) to a playlist id.
async function resolvePlaylistId(target) {
    if (target.id) return target.id;
    if (!target.name) return null;

    const playlists = await fetchUserPlaylists();
    const match = playlists.find((p) => p.title.trim().toLowerCase() === target.name.trim().toLowerCase());
    if (match) return match.id;

    // Fall back to substring match so near-misses still work.
    const partial = playlists.find((p) => p.title.trim().toLowerCase().includes(target.name.trim().toLowerCase()));
    if (partial) return partial.id;

    throw new Error(`Playlist "${target.name}" not found`);
}

async function addToPlaylist(videoId) {
    const target = await getTarget();
    const playlistId = await resolvePlaylistId(target);
    if (!playlistId) {
        showToast('Configure a playlist in the extension options first', true);
        chrome.runtime.openOptionsPage();
        return;
    }

    const data = await innerTubeCall('browse/edit_playlist', {
        playlistId,
        actions: [{ action: 'ACTION_ADD_VIDEO', addedVideoId: videoId }],
    });

    if (data.error) {
        throw new Error(data.error.message || 'Failed to add video');
    }
}

// List the user's playlists (name + id) via the "playlists aggregation" browse page.
async function fetchUserPlaylists() {
    const playlists = [];
    let token = null;

    do {
        const body = token
            ? { continuation: token }
            : { browseId: 'FEplaylist_aggregation' };

        const data = await innerTubeCall('browse', body);
        collectPlaylists(data, playlists);
        token = findContinuationToken(data);

        if (token) await new Promise((r) => setTimeout(r, 200));
    } while (token && playlists.length < MAX_PLAYLISTS);

    return playlists;
}

function collectPlaylists(node, out) {
    if (!node || typeof node !== 'object') return;

    if (Array.isArray(node)) {
        node.forEach((n) => collectPlaylists(n, out));
        return;
    }

    // Legacy grid / list items.
    if (node.gridPlaylistRenderer) {
        const r = node.gridPlaylistRenderer;
        pushPlaylist(out, r.playlistId, r.title);
    }
    if (node.playlistRenderer) {
        const r = node.playlistRenderer;
        pushPlaylist(out, r.playlistId, r.title);
    }
    // New Lit lockup items.
    if (node.lockupViewModel?.contentType === 'LOCKUP_CONTENT_TYPE_PLAYLIST') {
        const lk = node.lockupViewModel;
        pushPlaylist(out, lk.contentId, lk.metadata?.lockupMetadataViewModel?.title);
    }

    for (const key of Object.keys(node)) {
        if (key === 'gridPlaylistRenderer' || key === 'playlistRenderer' || key === 'lockupViewModel') continue;
        collectPlaylists(node[key], out);
    }
}

function pushPlaylist(out, id, title) {
    const text = title?.simpleText ?? title?.runs?.[0]?.text ?? title?.content;
    if (id && typeof text === 'string' && text) {
        out.push({ id, title: text });
    }
}

function findContinuationToken(node) {
    if (!node || typeof node !== 'object') return null;

    if (node.continuationCommand && typeof node.continuationCommand.token === 'string') {
        return node.continuationCommand.token;
    }
    if (Array.isArray(node)) {
        for (const n of node) {
            const t = findContinuationToken(n);
            if (t) return t;
        }
        return null;
    }
    for (const key of Object.keys(node)) {
        if (key === 'continuationCommand') continue;
        const t = findContinuationToken(node[key]);
        if (t) return t;
    }
    return null;
}

// ---------------------------------------------------------------------------
// Toast feedback
// ---------------------------------------------------------------------------
let toastTimer = null;
function showToast(message, isError = false) {
    let toast = document.getElementById('yt-private-watch-later-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'yt-private-watch-later-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.toggle('error', isError);
    toast.classList.add('visible');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 2500);
}

// ---------------------------------------------------------------------------
// Wiring: catch menu popups as they open.
// ---------------------------------------------------------------------------
const menuObserver = new MutationObserver(() => {
    // Debounce: only re-scan when a popup may have just opened.
    scheduleInject();
});
menuObserver.observe(document.body, { childList: true, subtree: true });