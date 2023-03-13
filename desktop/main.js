const path = require('path');
const {app, BrowserWindow, shell, ipcMain} = require('electron');

if (require('electron-squirrel-startup')) return app.quit();

function createWindow() {
    const window = new BrowserWindow({
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });
    window.loadURL('https://play.pokemonshowdown.com/');
}

ipcMain.on('browser-open', (event, url) => {
    shell.openExternal(url);
});

app.on('window-all-closed', () => app.quit());

app.whenReady().then(createWindow);
