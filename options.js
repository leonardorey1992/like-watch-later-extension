// Extract a playlist id from a URL like .../playlist?list=PLabc123 or a bare id.
const PLAYLIST_PREFIXES = /^(PL|UU|LL|FL|OL|WL|UL|RD|PU|AK|SP)/i;
const PLAYLIST_ID_RE = /^[A-Za-z0-9_-]{10,41}$/;

function extractPlaylistId(value) {
    const trimmed = value.trim();
    const urlMatch = trimmed.match(/[?&]list=([A-Za-z0-9_-]+)/);
    if (urlMatch) return urlMatch[1];
    if (PLAYLIST_ID_RE.test(trimmed) && PLAYLIST_PREFIXES.test(trimmed)) return trimmed;
    return null;
}

function updatePreview() {
    const id = extractPlaylistId(document.getElementById('playlist').value);
    const preview = document.getElementById('idPreview');
    if (id) {
        preview.style.display = 'block';
        preview.textContent = `Detected playlist id: ${id}`;
    } else {
        preview.style.display = 'none';
    }
}

function saveOptions() {
    const input = document.getElementById('playlist').value;
    const id = extractPlaylistId(input);

    chrome.storage.local.set({
        targetPlaylistName: id ? '' : input.trim(),
        targetPlaylistId: id || '',
    }, () => {
        const status = document.getElementById('status');
        status.className = 'ok';
        status.textContent = 'Options saved.';
        setTimeout(() => { status.textContent = ''; }, 3000);
    });
}

function restoreOptions() {
    chrome.storage.local.get(
        { targetPlaylistName: '', targetPlaylistId: '' },
        (items) => {
            const input = items.targetPlaylistId || items.targetPlaylistName;
            document.getElementById('playlist').value = input;
            updatePreview();
        },
    );
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('playlist').addEventListener('input', updatePreview);
document.getElementById('save').addEventListener('click', saveOptions);