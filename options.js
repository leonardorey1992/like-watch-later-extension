// Save options to chrome.storage
const saveOptions = () => {
    const playlist = document.getElementById('playlist').value;
    chrome.storage.local.set(
      { targetPlaylistName: playlist },
      () => {
        const status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(() => {
          status.textContent = '';
        }, 3000);
      }
    );
  };
  
  // Restores select box and checkbox state using the preferences
  // stored in chrome.storage.
  const restoreOptions = () => {
    chrome.storage.local.get(
      { targetPlaylistName: '' },
      (items) => {
        document.getElementById('playlist').value = items.targetPlaylistName;
      }
    );
  };
  
  document.addEventListener('DOMContentLoaded', restoreOptions);
  document.getElementById('save').addEventListener('click', saveOptions);
