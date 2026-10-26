// One-click "add to my chosen playlist" for YouTube.
// Injects a menu item into every video's 3-dot popup menu, then adds the video
// directly via YouTube's internal InnerTube API (same-origin fetch) — no dialog
// automation, no scrolling, no clicking through the native "Save" flow.

const STORAGE_NAME_KEY = 'targetPlaylistName';
const STORAGE_ID_KEY = 'targetPlaylistId';
const MENU_ITEM_CLASS = 'yt-private-watch-later-item';
const MENU_ITEM_ID = 'yt-private-watch-later-item';
const MAX_PLAYLISTS = 500;
const STAR_PATH = 'M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z';

// The video id of the menu most recently opened from a video context.
let pendingVideoId = null;

const VIDEO_HOLDER_SELECTOR = [
    'ytd-video-renderer',
    'ytd-compact-video-renderer',
    'ytd-rich-item-renderer',
    'ytd-grid-video-renderer',
    'ytd-playlist-panel-video-renderer',
    'ytd-playlist-video-renderer',
    'ytd-compact-radio-renderer',
    'ytd-reel-item-renderer',
    'ytd-reel-video-renderer',
    'ytm-shorts-lockup-view-model',
    'ytm-shorts-lockup-view-model-v2',
    'yt-lockup-view-model',
    '[data-video-id]',
].join(', ');

// ---------------------------------------------------------------------------
// Video id capture: every 3-dot (and other menu) button click inside a video
// renderer records that video's id so the menu we inject into knows what to add.
// ---------------------------------------------------------------------------
function videoIdFromHref(href) {
    if (!href) return null;
    const match = href.match(/[?&]v=([A-Za-z0-9_-]{11})/) || href.match(/\/shorts\/([A-Za-z0-9_-]{11})/);
    return match ? match[1] : null;
}

function videoIdForElement(el) {
    // On the watch page the current URL is authoritative (description links may
    // point at other videos).
    if (el.closest('ytd-watch-metadata, ytd-player, #movie_player')) {
        if (location.pathname === '/watch') {
            const watchId = new URLSearchParams(location.search).get('v');
            if (watchId) return watchId;
        }
        const pathId = location.pathname.match(/^\/(?:shorts|live)\/([A-Za-z0-9_-]{11})/);
        if (pathId) return pathId[1];
    }

    const holder = el.closest(VIDEO_HOLDER_SELECTOR);
    if (!holder) return null;

    const fromData = holder.getAttribute('data-video-id');
    if (fromData) return fromData;

    // Search results, grids, shelves and compact renderers expose the id via a link.
    const link = holder.querySelector('a[href*="watch?v="], a[href*="/shorts/"]');
    return videoIdFromHref(link?.getAttribute('href'));
}

function isActionMenuButton(button) {
    if (button.closest('ytd-in-feed-ad-layout-renderer, ytd-ad-slot-renderer, .ytVideoAttributeViewModelOverflowMenu')) return false;
    if (button.closest('.ytLockupMetadataViewModelMenuButton')) return true;

    const label = (button.getAttribute('aria-label') || '').toLowerCase();
    if (/action menu|more actions|más acciones|menú de acciones|mais ações|weitere aktionen|meer acties/.test(label)) return true;

    // The more-vert glyph is the same in every UI language. Checking the glyph
    // (instead of any button inside ytd-menu-renderer) keeps Share/Save out.
    const path = button.querySelector('svg path')?.getAttribute('d') || '';
    return path.startsWith('M12 4a2 2 0 100 4')
        || path.startsWith('M6 10a2 2 0 100 4')
        || path.startsWith('M12 8c1.1')
        || path.startsWith('M12 16.5c');
}

document.addEventListener('click', (e) => {
    // Clicking our own item must not overwrite the id captured when the menu opened.
    if (e.target.closest('.' + MENU_ITEM_CLASS)) return;

    const button = e.target.closest('button, yt-icon-button');
    if (!button) return;

    // Only a video's action-menu button carries a video id; any other button
    // clears it so we don't inject into unrelated menus/sheets.
    pendingVideoId = isActionMenuButton(button) ? videoIdForElement(button) : null;
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

function menuList(menu) {
    // Classic menus: ytd-menu-popup-renderer. New context menus are sheets.
    if (menu.tagName === 'YTD-MENU-POPUP-RENDERER') {
        return menu.querySelector('yt-list-view-model, tp-yt-paper-listbox');
    }
    return menu.querySelector('yt-list-view-model[role="menu"]');
}

function injectIntoOpenMenus() {
    // Only touch menus when we know the video this menu belongs to.
    if (!pendingVideoId) return;

    document.querySelectorAll('ytd-menu-popup-renderer, yt-sheet-view-model').forEach((menu) => {
        // Only the open menu is rendered; skip cached/hidden popups.
        if (!menu.getClientRects().length) return;

        // Skip menus that already have the item; re-inject if YouTube dropped it.
        if (menu.querySelector('.' + MENU_ITEM_CLASS)) return;

        const target = menuList(menu);
        if (!target) return;

        injectItem(target, menu);
    });
}

function setStarIcon(item) {
    const svg = item.querySelector('svg');
    if (svg) {
        // Keep the native icon wrapper so the star inherits its size and color.
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', STAR_PATH);
        svg.replaceChildren(path);
        return;
    }

    if (item.tagName === 'YT-LIST-ITEM-VIEW-MODEL') return;

    // Legacy row: styles.css sizes/colors this direct SVG like the native icons.
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('width', '24');
    icon.setAttribute('height', '24');
    icon.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', STAR_PATH);
    icon.appendChild(path);
    item.prepend(icon);
}

function injectItem(list, menuRoot) {
    // Current menus mix Lit items (yt-list-item-view-model) into legacy listboxes,
    // so clone a Lit item whenever one exists for the native look.
    const existing = list.querySelector('yt-list-item-view-model');
    const item = existing ? existing.cloneNode(true) : document.createElement('div');
    item.id = MENU_ITEM_ID;
    item.classList.add(MENU_ITEM_CLASS);

    if (existing) {
        item.removeAttribute('aria-selected');
        item.classList.remove('iron-selected', 'ytListItemViewModelHidden');
        // Drop the cloned item's subtitle/trailing text (e.g. "Try Premium for $0").
        item.querySelectorAll('.ytListItemViewModelSubtitleContainer, .ytListItemViewModelTrailingText')
            .forEach((el) => el.remove());
        item.querySelectorAll('.ytListItemViewModelHasSubtitle')
            .forEach((el) => el.classList.remove('ytListItemViewModelHasSubtitle'));
        setStarIcon(item);
        const titleEl = item.querySelector('.yt-list-item-view-model__title, .ytListItemViewModelTitle');
        if (titleEl) menuLabel().then((label) => { titleEl.textContent = label; });
    } else {
        // Legacy item: plain row styled by styles.css.
        const span = document.createElement('span');
        item.appendChild(span);
        setStarIcon(item);
        menuLabel().then((label) => { span.textContent = label; });
    }

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
            showToast('Added to my playlist');
            closeMenu(menuRoot);
        })
        .catch((err) => {
            showToast(err.message, true);
            closeMenu(menuRoot);
        });
}

function closeMenu(menuRoot) {
    const dropdown = menuRoot.closest('tp-yt-iron-dropdown');
    if (dropdown && typeof dropdown.close === 'function') {
        dropdown.close();
        return;
    }
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
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
// The request runs in YouTube's MAIN world (page_api.js): content scripts run in
// an isolated world and cannot read the page's window.ytcfg.
// ---------------------------------------------------------------------------
const PAGE_API_REQUEST = 'add-to-playlist:request';
const PAGE_API_RESPONSE = 'add-to-playlist:response';
let pageApiRequestId = 0;

function innerTubeCall(endpoint, body) {
    const requestId = ++pageApiRequestId;

    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            window.removeEventListener('message', onMessage);
            reject(new Error('YouTube API timeout'));
        }, 15000);

        function onMessage(e) {
            if (e.source !== window || e.data?.type !== PAGE_API_RESPONSE || e.data.requestId !== requestId) return;
            clearTimeout(timer);
            window.removeEventListener('message', onMessage);
            if (e.data.ok) resolve(e.data.data);
            else reject(new Error(e.data.error || 'YouTube request failed'));
        }

        window.addEventListener('message', onMessage);
        window.postMessage({ type: PAGE_API_REQUEST, requestId, endpoint, body }, '*');
    });
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
        // chrome.runtime.openOptionsPage() is not available to content scripts.
        showToast('Set a playlist from the extension icon first', true);
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
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        document.body.appendChild(toast);
    }

    const icon = document.createElement('span');
    icon.className = 'yt-private-watch-later-toast-icon';
    icon.innerHTML = isError
        ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 7h2v6h-2V7Zm0 8h2v2h-2v-2Z"/></svg>'
        : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17Z"/></svg>';

    const text = document.createElement('span');
    text.className = 'yt-private-watch-later-toast-text';
    text.textContent = message;

    toast.replaceChildren(icon, text);
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