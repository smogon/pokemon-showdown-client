const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    openInBrowser: url => ipcRenderer.send('browser-open', url),
});
