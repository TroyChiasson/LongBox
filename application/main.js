const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false // only set to false if you understand the implications
    }
  });

  // Load app.html as the window's content
  mainWindow.loadFile('longbox.html');

  // Open the DevTools.
  // mainWindow.webContents.openDevTools(); // Uncomment if you want to open DevTools by default
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
