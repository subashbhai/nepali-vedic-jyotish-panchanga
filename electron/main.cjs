const { app, BrowserWindow, Menu, ipcMain, shell, dialog, protocol, net } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

// Register custom standard protocol for 100% offline asset and page serving
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true,
      bypassCSP: true,
    },
  },
]);

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
  const iconPath = process.platform === 'win32'
    ? (fs.existsSync(path.join(__dirname, '../public/favicon.ico'))
        ? path.join(__dirname, '../public/favicon.ico')
        : path.join(__dirname, '../public/logo.png'))
    : path.join(__dirname, '../public/logo.png');

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 1024,
    minHeight: 700,
    title: 'बालानन्द वैदिक ज्योतिष, पञ्चाङ्ग तथा वास्तु सेवा',
    icon: iconPath,
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
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('trigger-check-updates');
            }
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
      mainWindow.loadURL('app://localhost/index.html').catch(() => {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
      });
    });
  } else {
    // 100% Offline production loading with standard origin semantics (works with /logo.png, /assets/...)
    mainWindow.loadURL('app://localhost/index.html').catch(() => {
      mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    });
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

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.cjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webmanifest': 'application/manifest+json',
};

// App lifecycle
app.whenReady().then(() => {
  // Setup custom 'app://' protocol to serve dist files with proper root-relative URL semantics
  // Uses fs.readFileSync which works transparently both inside app.asar and unpacked.
  protocol.handle('app', async (request) => {
    try {
      const parsedUrl = new URL(request.url);
      let pathname = decodeURIComponent(parsedUrl.pathname);

      if (!pathname || pathname === '/' || pathname === '/index.html') {
        pathname = 'index.html';
      } else if (pathname.startsWith('/')) {
        pathname = pathname.slice(1);
      }

      const distDir = path.join(__dirname, '../dist');
      const candidates = [
        path.join(distDir, pathname),
        path.join(__dirname, '../public', pathname),
        path.join(distDir, 'assets', pathname),
        path.join(__dirname, '../public/assets', pathname),
      ];

      let foundPath = null;
      for (const cand of candidates) {
        if (fs.existsSync(cand) && fs.statSync(cand).isFile()) {
          foundPath = cand;
          break;
        }
      }

      // Fallback to index.html for SPA routes without extension
      if (!foundPath && !path.extname(pathname)) {
        const indexPath = path.join(distDir, 'index.html');
        if (fs.existsSync(indexPath)) {
          foundPath = indexPath;
        }
      }

      if (foundPath) {
        const ext = path.extname(foundPath).toLowerCase();
        const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
        const data = fs.readFileSync(foundPath);
        return new Response(data, {
          status: 200,
          headers: {
            'Content-Type': mimeType,
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache',
          },
        });
      }

      console.warn('[Protocol app] File not found:', pathname);
      return new Response('File not found: ' + pathname, { status: 404 });
    } catch (err) {
      console.error('[Protocol app] Error handling request:', err);
      return new Response('Internal error', { status: 500 });
    }
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // Comprehensive Auto-updater with direct In-App Notification and Progress Events
  try {
    const { autoUpdater } = require('electron-updater');

    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;

    autoUpdater.on('checking-for-update', () => {
      console.log('[AutoUpdater] Checking for updates...');
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('updater-status', { status: 'checking' });
      }
    });

    autoUpdater.on('update-available', (info) => {
      console.log('[AutoUpdater] Update available:', info.version);
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('updater-status', {
          status: 'available',
          version: info.version,
          releaseDate: info.releaseDate,
          releaseNotes: typeof info.releaseNotes === 'string' ? info.releaseNotes : '',
        });
      }
    });

    autoUpdater.on('update-not-available', (info) => {
      console.log('[AutoUpdater] Update not available. Current version is latest.');
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('updater-status', {
          status: 'not-available',
          version: info.version,
        });
      }
    });

    autoUpdater.on('download-progress', (progressObj) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('updater-status', {
          status: 'downloading',
          percent: Math.round(progressObj.percent || 0),
          bytesPerSecond: progressObj.bytesPerSecond,
          transferred: progressObj.transferred,
          total: progressObj.total,
        });
      }
    });

    autoUpdater.on('update-downloaded', (info) => {
      console.log('[AutoUpdater] Update downloaded:', info.version);
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('updater-status', {
          status: 'downloaded',
          version: info.version,
        });
      }
    });

    autoUpdater.on('error', (err) => {
      console.warn('[AutoUpdater] Error during update check:', err ? err.message : err);
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('updater-status', {
          status: 'error',
          message: err ? err.message : 'Unknown error',
        });
      }
    });

    // Run update check 3.5 seconds after window is ready
    setTimeout(() => {
      autoUpdater.checkForUpdates().catch((err) => {
        console.log('[AutoUpdater] Initial check caught:', err ? err.message : err);
      });
    }, 3500);

    let downloadedUpdatePath = null;

    // IPC triggers
    ipcMain.handle('check-for-updates', async () => {
      try {
        const result = await autoUpdater.checkForUpdates();
        return { success: true, result };
      } catch (err) {
        return { success: false, error: err.message };
      }
    });

    ipcMain.handle('download-update', async (_event, customUrl) => {
      console.log('[AutoUpdater] download-update requested. customUrl:', customUrl);

      // Attempt 1: Official autoUpdater download if packaged
      if (app.isPackaged && autoUpdater) {
        try {
          console.log('[AutoUpdater] Triggering autoUpdater.downloadUpdate()...');
          await autoUpdater.downloadUpdate();
          return { success: true, method: 'electron-updater' };
        } catch (err) {
          console.warn('[AutoUpdater] autoUpdater.downloadUpdate() skipped or error:', err.message);
        }
      }

      // Attempt 2: Direct streaming in-app downloader
      try {
        const https = require('https');
        const http = require('http');
        const fs = require('fs');
        const os = require('os');
        const path = require('path');

        const targetUrl = customUrl || 'https://github.com/subashbhai/nepali-vedic-jyotish-panchanga/releases/download/v1.0.0/nepali-vedic-jyotish-panchanga-setup-1.0.0.exe';
        const tempFilePath = path.join(os.tmpdir(), `nepali-vedic-setup-update-${Date.now()}.exe`);

        console.log('[InAppDownloader] Streaming update from:', targetUrl, 'to:', tempFilePath);

        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('updater-status', {
            status: 'downloading',
            percent: 0,
            transferred: 0,
            total: 100
          });
        }

        const downloadWithRedirects = (url, depth = 0) => {
          if (depth > 8) {
            const err = new Error('Too many redirects');
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('updater-status', { status: 'error', message: err.message });
            }
            return;
          }
          const client = url.startsWith('https:') ? https : http;
          client.get(url, { headers: { 'User-Agent': 'Nepali-Vedic-Desktop' } }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
              const redirectUrl = new URL(res.headers.location, url).toString();
              return downloadWithRedirects(redirectUrl, depth + 1);
            }

            if (res.statusCode !== 200) {
              const err = new Error(`Download failed with status: ${res.statusCode}`);
              if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('updater-status', {
                  status: 'error',
                  message: err.message
                });
              }
              return;
            }

            const totalBytes = parseInt(res.headers['content-length'] || '0', 10);
            let transferredBytes = 0;
            const fileStream = fs.createWriteStream(tempFilePath);

            let lastPercent = -1;
            res.on('data', (chunk) => {
              transferredBytes += chunk.length;
              if (totalBytes > 0) {
                const percent = Math.min(100, Math.round((transferredBytes / totalBytes) * 100));
                if (percent !== lastPercent) {
                  lastPercent = percent;
                  if (mainWindow && !mainWindow.isDestroyed()) {
                    mainWindow.webContents.send('updater-status', {
                      status: 'downloading',
                      percent,
                      transferred: transferredBytes,
                      total: totalBytes
                    });
                  }
                }
              }
            });

            res.pipe(fileStream);

            fileStream.on('finish', () => {
              fileStream.close();
              downloadedUpdatePath = tempFilePath;
              console.log('[InAppDownloader] Download completed successfully at:', tempFilePath);
              if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('updater-status', {
                  status: 'downloaded',
                  version: 'नवीनतम'
                });
              }
            });

            fileStream.on('error', (err) => {
              fs.unlink(tempFilePath, () => {});
              if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('updater-status', {
                  status: 'error',
                  message: err.message
                });
              }
            });
          }).on('error', (err) => {
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('updater-status', {
                status: 'error',
                message: err.message
              });
            }
          });
        };

        downloadWithRedirects(targetUrl);
        return { success: true, method: 'direct-stream' };
      } catch (directErr) {
        console.error('[InAppDownloader] Direct stream failed:', directErr);
        return { success: false, error: directErr.message };
      }
    });

    ipcMain.handle('restart-and-install', () => {
      try {
        if (downloadedUpdatePath && fs.existsSync(downloadedUpdatePath)) {
          console.log('[InAppDownloader] Launching downloaded installer:', downloadedUpdatePath);
          shell.openPath(downloadedUpdatePath);
          setTimeout(() => {
            app.quit();
          }, 1200);
          return { success: true };
        }

        if (autoUpdater && app.isPackaged) {
          autoUpdater.quitAndInstall(false, true);
          return { success: true };
        }

        return { success: true };
      } catch (err) {
        return { success: false, error: err.message };
      }
    });
  } catch (e) {
    console.log('[AutoUpdater] electron-updater setup error:', e.message);
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
