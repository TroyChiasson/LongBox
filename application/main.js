const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1600,
    height: 1200,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false // only set to false if you understand the implications
    }
  });

  // Load app.html as the window's content
  mainWindow.loadFile('app.html');

  // Open the DevTools if you want, comment out if not
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function() {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
