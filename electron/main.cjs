const { app, BrowserWindow, Menu, ipcMain, shell, dialog } = require('electron');
const path = require('path');

let mainWindow = null;

// Single instance lock - prevent duplicate apps
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 1024,
    minHeight: 700,
    title: 'बालानन्द वैदिक ज्योतिष, पञ्चाङ्ग तथा वास्तु सेवा',
    icon: path.join(__dirname, '../public/logo.png'),
    backgroundColor: '#FAF8F5',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
    },
  });

  // Setup Application Menu
  const isMac = process.platform === 'darwin';
  const menuTemplate = [
    ...(isMac ? [{
      label: 'वैदिक ज्योतिष',
      submenu: [
        { role: 'about', label: 'एपको बारेमा' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit', label: 'बन्द गर्नुहोस्' },
      ],
    }] : []),
    {
      label: 'फाइल (File)',
      submenu: [
        {
          label: 'प्रिन्ट / PDF सेभ गर्नुहोस्',
          accelerator: 'CmdOrCtrl+P',
          click: () => {
            if (mainWindow) mainWindow.webContents.print();
          },
        },
        {
          label: 'रिलोड गर्नुहोस् (Reload)',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            if (mainWindow) mainWindow.reload();
          },
        },
        { type: 'separator' },
        isMac ? { role: 'close', label: 'विन्डो बन्द गर्नुहोस्' } : { role: 'quit', label: 'बाहिरिनुहोस् (Exit)' },
      ],
    },
    {
      label: 'सम्पादन (Edit)',
      submenu: [
        { role: 'undo', label: 'पूर्ववत् (Undo)' },
        { role: 'redo', label: 'पुनः गर्नुहोस् (Redo)' },
        { type: 'separator' },
        { role: 'cut', label: 'काट्नुहोस् (Cut)' },
        { role: 'copy', label: 'प्रतिलिपि (Copy)' },
        { role: 'paste', label: 'टाँस्नुहोस् (Paste)' },
        { role: 'selectAll', label: 'सबै छान्नुहोस् (Select All)' },
      ],
    },
    {
      label: 'दृश्य (View)',
      submenu: [
        { role: 'resetZoom', label: 'सामान्य आकार (Actual Size)' },
        { role: 'zoomIn', label: 'ठूलो बनाउनुहोस् (Zoom In)' },
        { role: 'zoomOut', label: 'सानो बनाउनुहोस् (Zoom Out)' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'पूर्ण पर्दा (Full Screen)' },
        {
          label: 'डेभलपर टूल्स (DevTools)',
          accelerator: 'F12',
          click: () => {
            if (mainWindow) mainWindow.webContents.toggleDevTools();
          },
        },
      ],
    },
    {
      label: 'मद्दत (Help)',
      submenu: [
        {
          label: 'नयाँ अपडेट जाँच गर्नुहोस् (Check for Updates)',
          click: () => {
            shell.openExternal('https://github.com/subashbhai/nepali-vedic-jyotish-panchanga/releases');
          },
        },
        {
          label: 'GitHub Repository खोल्नुहोस्',
          click: () => {
            shell.openExternal('https://github.com/subashbhai/nepali-vedic-jyotish-panchanga');
          },
        },
        { type: 'separator' },
        {
          label: 'एपको बारेमा (About)',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'नेपाली वैदिक ज्योतिष तथा पञ्चाङ्ग',
              message: 'बालानन्द वैदिक ज्योतिष, पञ्चाङ्ग, कुण्डली तथा वास्तु सेवा',
              detail: `संस्करण: 1.0.0 (Desktop Offline Edition)\nनेपालकै सबैभन्दा भरपर्दो तथा सटिक वैदिक ज्योतिषीय गणना प्रणाली।\n© २०२६ बालानन्द सेवा केन्द्र`,
              buttons: ['ठीक छ'],
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // Load App: Check development vs production
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  if (isDev && process.env.ELECTRON_START_URL) {
    mainWindow.loadURL(process.env.ELECTRON_START_URL);
  } else if (isDev) {
    mainWindow.loadURL('http://localhost:3000').catch(() => {
      // Fallback to local dist file if dev server is not running
      mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    });
  } else {
    // 100% Offline production loading directly from disk
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Open external links in default browser instead of electron window
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // Optional: Auto-updater initialization if electron-updater is installed
  try {
    const { autoUpdater } = require('electron-updater');
    autoUpdater.checkForUpdatesAndNotify().catch((err) => {
      console.log('[AutoUpdater] Update check silently handled:', err.message);
    });
  } catch (e) {
    // electron-updater optional fallback
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Communication
ipcMain.handle('get-app-version', () => app.getVersion());
ipcMain.handle('print-page', () => {
  if (mainWindow) mainWindow.webContents.print();
});
