const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const started = require('electron-squirrel-startup');
const fetch = require('node-fetch');
const https = require('https');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// Handle API requests
ipcMain.handle('send-request', async (event, { method, url, headers, body, params }) => {
  try {
    // Validate and format URL
    let finalUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      // Use http:// for localhost, https:// for everything else
      if (url.startsWith('localhost') || url.startsWith('127.0.0.1')) {
        finalUrl = 'http://' + url;
      } else {
        finalUrl = 'https://' + url;
      }
    }

    // Add query parameters
    const queryParams = new URLSearchParams(params).toString();
    if (queryParams) {
      finalUrl += (finalUrl.includes('?') ? '&' : '?') + queryParams;
    }

    console.log('Making request to:', finalUrl);

    const fetchOptions = {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      agent: finalUrl.startsWith('https://') ? 
        new https.Agent({ rejectUnauthorized: false }) : 
        undefined
    };

    const response = await fetch(finalUrl, fetchOptions);

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    return {
      status: response.status,
      headers: Object.fromEntries(response.headers),
      data,
    };
  } catch (error) {
    console.error('Request error:', error);
    throw error;
  }
});
