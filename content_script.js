// Constants
const TARGET_PLAYLIST_KEY = 'targetPlaylistName';
const MENU_ITEM_CLASS = 'yt-private-watch-later-item';
const INJECTED_FLAG_CLASS = 'yt-private-watch-later-injected';
const SAVE_TO_PLAYLIST_TEXT = 'Save to private watch later';

// Logger
const log = (...args) => console.warn('[Private Watch Later]', ...args);

log('Content script loaded and running'); // Immediate verification

function checkForMenus() {
    const popupContainer = document.querySelector('ytd-popup-container');
    if (popupContainer) {
        const menus = popupContainer.querySelectorAll('ytd-menu-popup-renderer');
        menus.forEach(menu => {
            if (!menu.classList.contains(INJECTED_FLAG_CLASS)) {
                log('Found menu popup via check, attempting inject...');
                injectMenuItem(menu);
            }
        });
    }
}

// Main Observer
const observer = new MutationObserver((mutations) => {
    // Check specifically if ytd-popup-container exists
    const popupContainer = document.querySelector('ytd-popup-container');

    if (popupContainer) {
        // If we haven't observed the popup container directly yet, let's switch to observing IT
        // This is more efficient and accurate
        if (!popupContainer.hasAttribute('observed-by-pwl')) {
            popupContainer.setAttribute('observed-by-pwl', 'true');
            popupObserver.observe(popupContainer, { childList: true, subtree: true });
            log('Attached observer to ytd-popup-container');
        }
    }

    // Also check standard method for initial load
    checkForMenus();
});

const popupObserver = new MutationObserver((mutations) => {
    mutations.forEach(m => {
        m.addedNodes.forEach(node => {
            if (node.nodeName === '#text') return;
            // log('Popup mutation node:', node.nodeName, node.className);

            // It could be ytd-menu-popup-renderer OR tp-yt-iron-dropdown
            if (node.tagName && (
                node.tagName.includes('MENU-POPUP') ||
                node.tagName.includes('IRON-DROPDOWN') ||
                node.classList?.contains('ytd-menu-popup-renderer')
            )) {
                log('Potential menu detected:', node.tagName);
                injectMenuItem(node);
            }
        });
    });
});

observer.observe(document.body, { childList: true, subtree: true });

// Fallback: Listen for clicks on the 3-dots button
document.addEventListener('click', (e) => {
    const target = e.target;
    // Check if it's a menu button (usually has icon "more_vert" or is a yt-icon-button)
    const button = target.closest('button, yt-icon-button');
    if (button) {
        // log('Button clicked:', button);
        // If it looks like a menu button, poll for the popup
        setTimeout(checkForMenus, 100);
        setTimeout(checkForMenus, 500);
    }
}, true);

// Initial check in case we loaded late
checkForMenus();
// Periodically check just in case observer misses (Youtube is tricky)
setInterval(checkForMenus, 2000); // Keep this for resilience


const NEW_MENU_TAG = 'yt-list-view-model';
const NEW_ITEM_TAG = 'yt-list-item-view-model';

function injectMenuItem(menuContainer) {
    if (menuContainer.classList.contains(INJECTED_FLAG_CLASS)) return;
    menuContainer.classList.add(INJECTED_FLAG_CLASS);

    const attemptInject = () => {
        // Old Style
        const listBox = menuContainer.querySelector('tp-yt-paper-listbox') ||
            menuContainer.querySelector('#items');

        // New Style (Lit)
        const litList = menuContainer.querySelector(NEW_MENU_TAG);

        if (litList) {
            addOptionNew(litList, menuContainer);
            return true;
        }
        if (listBox) {
            addOption(listBox, menuContainer);
            return true;
        }
        return false;
    };

    // 1. Try immediately
    if (attemptInject()) return;

    // 2. If not found, observe
    log('Menu content not found yet, observing...');

    const menuContentObserver = new MutationObserver((mutations, obs) => {
        if (attemptInject()) {
            log('Menu content appeared and option injected!');
            obs.disconnect();
        }
    });

    menuContentObserver.observe(menuContainer, { childList: true, subtree: true });
    setTimeout(() => menuContentObserver.disconnect(), 5000);
}

// Logic for the NEW Lit-based menu
function addOptionNew(container, menuRoot) {
    // We clone an existing item to get the exact structure and classes
    const existingItem = container.querySelector(NEW_ITEM_TAG);
    if (!existingItem) return;

    const clone = existingItem.cloneNode(true);
    clone.classList.add(MENU_ITEM_CLASS);

    // Update Text
    const titleEl = clone.querySelector('.yt-list-item-view-model__title');
    if (titleEl) titleEl.textContent = SAVE_TO_PLAYLIST_TEXT;

    // Update Icon (Use a generic "lock" or "visibility_off" or "playlist_add_check" icon)
    // For now we keeps the cloned icon or replace the SVG path if we want specific one.
    // Let's rely on the clone for style, maybe change icon later if needed.

    // cleanup events from clone? cloneNode doesn't copy listeners, so we are good.

    clone.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        log('Custom New-UI option clicked');

        const playlistName = await getPlaylistName();
        if (!playlistName) return;

        // Find the native "Save to playlist" button in THIS specific menu
        const items = Array.from(container.querySelectorAll(NEW_ITEM_TAG));

        // Debug: Log all items to see what we are working with
        // log('Items in menu:', items.map(i => i.innerText.replace(/\n/g, ' ')));

        const saveItem = items.find(item => {
            // CRITICAL: Ignore our own button!
            if (item.classList.contains(MENU_ITEM_CLASS) || item.innerText.includes(SAVE_TO_PLAYLIST_TEXT)) {
                return false;
            }

            const text = item.innerText.toLowerCase();
            const iconPath = item.querySelector('path')?.getAttribute('d');

            // EXCLUSIONS: specific words that mean "Queue" or "Watch Later" (native) or "Share"
            if (text.includes('queue') || text.includes('cola') || text.includes('compartir') || text.includes('share')) return false;

            // MATCHERS
            // 1. Aria Label (Strongest)
            const ariaLabel = item.getAttribute('aria-label')?.toLowerCase() || '';
            const isSaveAria = (ariaLabel.includes('save') || ariaLabel.includes('guardar') || ariaLabel.includes('añadir')) &&
                (ariaLabel.includes('playlist') || ariaLabel.includes('lista'));

            if (isSaveAria) {
                item.dataset.matchReason = "aria";
                return true;
            }

            // 2. Text Content
            const hasActionWord = text.includes('save') || text.includes('guardar') || text.includes('añadir');
            const hasTargetWord = text.includes('playlist') || text.includes('lista') || text.includes('list');

            // Allow exact "Save" if it's not "Save to Watch Later" (which usually has "later" or "ver más tarde")
            const isJustSave = text.trim() === 'save' || text.trim() === 'guardar';
            const isNotWatchLater = !text.includes('later') && !text.includes('tarde');

            const isSaveText = (hasActionWord && hasTargetWord) || (isJustSave && isNotWatchLater);

            // 3. Icon Paths
            // YouTube uses various icons for "save". Add more known paths if needed.
            // M14 10H2v2h12v-2zm0-4H2v2h12V6zm4 8v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM2 16h8v-2H2v2z (playlist_add)
            // M22 13h-4v-4h-2v4h-4v2h4v4h2v-4h4v-2z (another variant)
            const isSaveIcon = iconPath && (
                iconPath.startsWith('M19 2H5') ||
                iconPath.startsWith('M17 3H7') ||
                iconPath.includes('M14 10H2') || // playlist_add
                iconPath.includes('M22 13h-4')   // plus icon often used
            );

            if (isSaveText) item.dataset.matchReason = "text";
            if (isSaveIcon) item.dataset.matchReason = "icon";

            return isSaveText || isSaveIcon;
        });

        if (saveItem) {
            log(`Found Native Save Item (Lit) via [${saveItem.dataset.matchReason}], clicking:`, saveItem.innerText.replace(/\n/g, ' '));
            saveItem.click();
            handlePlaylistDialog(playlistName);
        } else {
            console.error('[Private Watch Later] Could not find native "Save" button in Lit menu.');
            log('Available items were:', items.map(i => i.innerText.replace(/\n/g, ' ')));
            alert('Error: Could not find "Save to playlist" button. See console for details.');

            // Only close manually if we FAILED to find the button
            const popup = menuRoot.closest('tp-yt-iron-dropdown') || document.querySelector('ytd-popup-container');
            if (popup) popup.click();
        }
    });

    // Insert at top
    container.prepend(clone);
}

function addOption(container, menuRoot) {
    if (container.querySelector('.' + MENU_ITEM_CLASS)) return;

    const option = document.createElement('div');
    option.className = MENU_ITEM_CLASS;
    option.textContent = SAVE_TO_PLAYLIST_TEXT;
    option.style.display = 'flex';
    option.style.alignItems = 'center';
    option.style.padding = '8px 16px';
    option.style.cursor = 'pointer';
    option.style.fontSize = '1.4rem';

    option.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        log('Custom option clicked');

        const playlistName = await getPlaylistName();
        if (!playlistName) return;

        const menuItems = Array.from(container.querySelectorAll('ytd-menu-service-item-renderer, ytd-menu-navigation-item-renderer'));

        const saveItem = menuItems.find(item => {
            const icon = item.querySelector('yt-icon')?.getAttribute('icon');
            const text = item.innerText.toLowerCase();
            return (text.includes('save') && (text.includes('playlist') || text.length < 30)) ||
                (icon && icon.includes('playlist_add'));
        });

        if (saveItem) {
            log('Found Native Save Button, clicking...');
            saveItem.click();
            handlePlaylistDialog(playlistName);
        } else {
            // Fallback for newer items mixed in old container?
            console.error('[Private Watch Later] Could not find native "Save" button.');
            alert('Error: Could not find "Save" button.');
        }
    });

    container.prepend(option);
}


function getPlaylistName() {
    return new Promise((resolve) => {
        chrome.storage.local.get({ [TARGET_PLAYLIST_KEY]: '' }, (items) => {
            let name = items[TARGET_PLAYLIST_KEY];
            if (!name) {
                name = prompt('Enter the exact name of your private Watch Later playlist:');
                if (name) {
                    name = name.trim();
                    chrome.storage.local.set({ [TARGET_PLAYLIST_KEY]: name });
                }
            }
            resolve(name);
        });
    });
}

function handlePlaylistDialog(targetName) {
    // Wait for the dialog to appear.
    // It could be 'ytd-add-to-playlist-renderer', 'yt-add-to-playlist-view-model', or inside a 'tp-yt-paper-dialog'.
    // Detection logic encapsulated
    const checkDialog = (source) => {
        // Broad search for ANY promising dialog container
        const potentialDialogs = document.querySelectorAll('ytd-add-to-playlist-renderer, yt-add-to-playlist-view-model, tp-yt-paper-dialog, yt-confirm-dialog-renderer');

        for (const dialog of potentialDialogs) {
            // Check if it's visible
            if (!dialog.hidden && dialog.offsetHeight > 0) {
                // Check if it seems to contain playlist items.
                // RELAXED CHECK: Don't check for "playlist" text as it fails in non-English (e.g. Spanish "Lista").
                // Trust the tag name OR check for generic list items.
                const hasItems = dialog.querySelector('ytd-playlist-add-to-option-renderer') ||
                    dialog.querySelector('yt-playlist-add-to-option-view-model') ||
                    dialog.querySelector('#items') ||
                    dialog.querySelector('yt-list-item-view-model');

                if (hasItems) {
                    log(`Dialog detected via ${source} (found items):`, dialog.tagName);
                    cleanup();
                    // INCREASED DELAY: Wait 500ms (was 100ms) to ensure UI is stable/interactive
                    setTimeout(() => interactWithDialog(dialog, targetName), 500);
                    return true;
                }

                // Fallback: if it's the specific renderer we want, assume it's good even if empty briefly?
                if (dialog.tagName.includes('ADD-TO-PLAYLIST')) {
                    log(`Dialog detected via ${source} (tag match):`, dialog.tagName);
                    cleanup();
                    setTimeout(() => interactWithDialog(dialog, targetName), 100);
                    return true;
                }
            }
        }
        return false;
    };

    let pollInterval;
    const cleanup = () => {
        dialogObserver.disconnect();
        if (pollInterval) clearInterval(pollInterval);
    };

    // 1. Observer
    const dialogObserver = new MutationObserver((mutations) => {
        checkDialog('Observer');
    });

    dialogObserver.observe(document.body, { childList: true, subtree: true });

    // 2. Polling Fallback (Essential for resilience)
    pollInterval = setInterval(() => {
        if (checkDialog('Poll')) return;
        // Optional: deeper debug log every 1s?
    }, 200);

    // check immediately just in case
    setTimeout(() => checkDialog('Immediate'), 50);

    // Timeout
    setTimeout(() => {
        cleanup();
        log('Dialog wait timed out.');
    }, 8000);
}

// Helper to find the scrollable list container
function findListContainer(dialog) {
    return dialog.querySelector('#playlists') ||
        dialog.querySelector('ytd-playlist-add-to-option-renderer')?.parentElement ||
        dialog.querySelector('yt-playlist-add-to-option-view-model')?.parentElement ||
        dialog.querySelector('toggleable-list-item-view-model')?.parentElement || // Added for new Lit items
        dialog.querySelector('#items');
}

async function interactWithDialog(dialog, targetName) {
    log('Interacting with dialog for:', targetName);

    const listContainer = findListContainer(dialog);
    if (!listContainer) {
        log('Could not find list container, trying naive search...');
    }

    // SCROLL AND SEARCH LOGIC
    let attempts = 0;
    const maxAttempts = 10; // Avoid infinite loops
    let foundItem = null;

    const normalize = (str) => str ? str.replace(/\s+/g, ' ').trim().toLowerCase() : '';
    const target = normalize(targetName);

    while (attempts < maxAttempts) {
        // 1. Scan current items
        // User provided specific HTML: toggleable-list-item-view-model -> yt-list-item-view-model
        const items = Array.from(dialog.querySelectorAll('ytd-playlist-add-to-option-renderer, yt-playlist-add-to-option-view-model, tp-yt-paper-checkbox, toggleable-list-item-view-model'));

        foundItem = items.find(item => {
            const titleEl = item.querySelector('#label') ||
                item.querySelector('.yt-playlist-add-to-option-view-model__title') ||
                item.querySelector('.yt-list-item-view-model__title') || // Found in user HTML
                item.querySelector('.yt-core-attributed-string');
            const title = normalize(titleEl?.textContent || item.innerText);
            return title.includes(target);
        });

        if (foundItem) break;

        // 2. If not found, try to scroll
        if (listContainer && listContainer.scrollHeight > listContainer.clientHeight) {
            log(`Item not found, scrolling... (attempt ${attempts + 1})`);
            listContainer.scrollTop += 300; // Scroll down
            await new Promise(r => setTimeout(r, 400)); // Wait for render
            attempts++;
        } else {
            break;
        }
    }

    if (foundItem) {
        log('Found target playlist:', targetName);

        // CHECKBOX LOGIC / STATE CHECK
        // User HTML has `aria-pressed="false"` on the inner `yt-list-item-view-model`
        const innerItem = foundItem.querySelector('yt-list-item-view-model') || foundItem;

        const checkbox = foundItem.querySelector('#checkbox') ||
            foundItem.querySelector('input[type="checkbox"]');

        // Check state:
        // 1. Classic checkbox .checked
        // 2. Aria-checked
        // 3. Aria-pressed (from user HTML)
        const isChecked = (checkbox && checkbox.checked) ||
            foundItem.classList.contains('checked') ||
            foundItem.getAttribute('aria-checked') === 'true' ||
            innerItem.getAttribute('aria-pressed') === 'true';

        if (!isChecked) {
            log('Playlist unchecked. Clicking to add...');
            // Pre-click safety delay as requested by user ("Wait a delay before clicking")
            await new Promise(r => setTimeout(r, 200));

            // Click the clickable element. User said: "u need to click the this html element" -> toggleable-list-item-view-model matches well as host.
            // But usually the check tap area is the row.
            foundItem.click();

            // Visual feedback
            const originalBg = foundItem.style.backgroundColor;
            foundItem.style.backgroundColor = '#e8f5e9'; // Light green flash
            setTimeout(() => foundItem.style.backgroundColor = originalBg, 500);

            // Close dialog after short delay to verify visual
            setTimeout(() => {
                const closeBtn = dialog.querySelector('#close-button') ||
                    document.querySelector('yt-icon-button[icon="close"]');
                if (closeBtn) closeBtn.click();
                else document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
            }, 800);
        } else {
            log('Playlist ALREADY checked (aria-pressed/checked). Doing nothing.');
            // Close dialog immediately
            const closeBtn = dialog.querySelector('#close-button') ||
                document.querySelector('yt-icon-button[icon="close"]');
            if (closeBtn) closeBtn.click();
        }

    } else {
        const items = Array.from(dialog.querySelectorAll('ytd-playlist-add-to-option-renderer, yt-playlist-add-to-option-view-model'));
        const available = items.map(i => i.innerText.replace(/\n/g, ' ').trim()).join('\n');

        console.error(`[Private Watch Later] Playlist "${targetName}" not found after scrolling.`);
        alert(`Error: Playlist "${targetName}" not found.\n\nScanned playlists:\n${available}\n\nPlease check your playlist name.`);
    }
}
