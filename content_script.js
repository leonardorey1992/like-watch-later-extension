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

        // We look for the item that is likely "Save to playlist"
        const saveItem = items.find(item => {
            // CRITICAL: Ignore our own button!
            if (item.classList.contains(MENU_ITEM_CLASS) || item.innerText.includes(SAVE_TO_PLAYLIST_TEXT)) {
                log('Skipping own injected item:', item.innerText);
                return false;
            }

            const text = item.innerText.toLowerCase();
            const iconPath = item.querySelector('path')?.getAttribute('d');

            // Check for "Save" keyword + "playlist" or just match the Bookmark icon path found in user snippet
            const isSaveText = (text.includes('save') || text.includes('guardar') || text.includes('añadir')) &&
                (text.includes('playlist') || text.includes('lista') || text.includes('ver más tarde') === false);

            const isSaveIcon = iconPath && (iconPath.startsWith('M19 2H5') || iconPath.startsWith('M14 10H3') || iconPath.startsWith('M22 13h-4'));

            return isSaveText || isSaveIcon;
        });

        if (saveItem) {
            log('Found Native Save Item (Lit), clicking...', saveItem.innerText);
            saveItem.click();
            handlePlaylistDialog(playlistName);
        } else {
            console.error('[Private Watch Later] Could not find native "Save" button in Lit menu.');

            // Fallback debug: print all items
            log('Available items:', items.map(i => i.innerText));
            alert('Error: Could not find "Save to playlist" button.');
        }

        // Close menu manually if needed (Lit menus might not close auto if we intercepted click?)
        // Usually clicking the item closes it bc it is a semantic menu item. 
        // If we prevented default, we might need to close it.
        // Try finding the backdrop or just letting it be.
        const popup = menuRoot.closest('tp-yt-iron-dropdown') || document.querySelector('ytd-popup-container');
        if (popup) popup.click(); // Hacky close?
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
                name = prompt('Enter the exact name of your private Watch Later playlist (case-sensitive):');
                if (name) {
                    chrome.storage.local.set({ [TARGET_PLAYLIST_KEY]: name });
                }
            }
            resolve(name);
        });
    });
}

function handlePlaylistDialog(targetName) {
    // Wait for ytd-add-to-playlist-renderer
    const dialogObserver = new MutationObserver((mutations, obs) => {
        const dialog = document.querySelector('ytd-add-to-playlist-renderer');
        if (dialog && !dialog.hidden) {
            obs.disconnect(); // Stop watching
            log('Dialog appeared');
            // Allow list to render
            setTimeout(() => interactWithDialog(dialog, targetName), 500);
        }
    });

    dialogObserver.observe(document.body, { childList: true, subtree: true });

    // Safety timeout
    setTimeout(() => dialogObserver.disconnect(), 10000);
}

function interactWithDialog(dialog, targetName) {
    // Determine if we need to verify checking status.
    // The list items are usually ytd-playlist-add-to-option-renderer
    const items = Array.from(dialog.querySelectorAll('ytd-playlist-add-to-option-renderer'));

    const targetItem = items.find(item => {
        const title = item.querySelector('#label')?.title || item.innerText;
        return title.trim().includes(targetName); // Loose match or strict? start with loose
    });

    if (targetItem) {
        const checkbox = targetItem.querySelector('#checkbox');
        // Check if already checked?
        const isChecked = checkbox.classList.contains('checked') || checkbox.getAttribute('aria-checked') === 'true';

        if (!isChecked) {
            log('Clicking target playlist:', targetName);
            targetItem.click(); // This usually toggles it

            // Show feedback?
            // YouTube usually shows a toast "Saved to [Playlist]"
        } else {
            log('Already saved to', targetName);
        }

        // Close dialog
        // Is there a close button? usually #close-button
        setTimeout(() => {
            const closeBtn = dialog.querySelector('#close-button') || document.querySelector('yt-icon-button[icon="close"]');
            if (closeBtn) closeBtn.click();
            // Also try pressing Esc
            else document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        }, 800);

    } else {
        alert(`Playlist "${targetName}" not found in the list. Please check the name or create it first.`);
    }
}
