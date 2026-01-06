const { app, BrowserWindow, Menu, shell, Notification, Tray, nativeImage } = require('electron');
const path = require('path');

// Keep a global reference of the window object
let mainWindow;
let tray = null;

// Messenger URL
const MESSENGER_URL = 'https://www.messenger.com';

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 400,
    minHeight: 300,
    title: 'Messenger',
    icon: path.join(__dirname, 'icons', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      // Enable features needed for Messenger
      webviewTag: false,
      sandbox: true,
    },
    /**
     * Window drag/move affordance:
     *
     * On macOS, `titleBarStyle: 'hiddenInset'` makes web contents extend into the
     * titlebar area. For remote pages (messenger.com), we cannot reliably add a
     * draggable region (`-webkit-app-region: drag`) without breaking their UI,
     * which can make the window effectively non-draggable.
     *
     * Using the default title bar guarantees a consistent draggable region
     * across platforms.
     */
    titleBarStyle: 'default',
    backgroundColor: '#ffffff',
    show: false, // Don't show until ready
  });

  // Load Messenger
  mainWindow.loadURL(MESSENGER_URL);

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Open external links in default browser
    if (!url.startsWith('https://www.messenger.com') && !url.startsWith('https://www.facebook.com')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  // Handle navigation
  mainWindow.webContents.on('will-navigate', (event, url) => {
    // Allow navigation within Messenger and Facebook
    if (!url.startsWith('https://www.messenger.com') && 
        !url.startsWith('https://www.facebook.com') &&
        !url.startsWith('https://m.facebook.com')) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  // Inject custom CSS for better desktop experience
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.insertCSS(`
      /* Hide mobile-specific elements if any */
      /* Custom scrollbar for better desktop feel */
      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      ::-webkit-scrollbar-track {
        background: transparent;
      }
      ::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 4px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: rgba(0, 0, 0, 0.3);
      }
    `);
  });

  // Handle page title changes for notifications
  mainWindow.webContents.on('page-title-updated', (event, title) => {
    // Check for unread messages in title (e.g., "(3) Messenger")
    const match = title.match(/^\((\d+)\)/);
    if (match) {
      const count = parseInt(match[1], 10);
      if (process.platform === 'darwin') {
        app.dock.setBadge(count.toString());
      }
      // Update tray icon if needed
      if (tray) {
        tray.setToolTip(`Messenger - ${count} unread`);
      }
    } else {
      if (process.platform === 'darwin') {
        app.dock.setBadge('');
      }
      if (tray) {
        tray.setToolTip('Messenger');
      }
    }
  });

  // Handle window close
  mainWindow.on('close', (event) => {
    if (process.platform === 'darwin') {
      // On macOS, hide instead of quit
      if (!app.isQuitting) {
        event.preventDefault();
        mainWindow.hide();
      }
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Create application menu
function createMenu() {
  const template = [
    ...(process.platform === 'darwin' ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'New Conversation',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            if (mainWindow) {
              mainWindow.loadURL('https://www.messenger.com/new');
            }
          }
        },
        { type: 'separator' },
        process.platform === 'darwin' ? { role: 'close' } : { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(process.platform === 'darwin' ? [
          { type: 'separator' },
          { role: 'front' }
        ] : [
          { role: 'close' }
        ])
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Messenger Help',
          click: () => {
            shell.openExternal('https://www.facebook.com/help/messenger-app');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Create tray icon (optional, for system tray)
function createTray() {
  const iconPath = path.join(__dirname, 'icons', 'icon.png');
  const icon = nativeImage.createFromPath(iconPath);
  tray = new Tray(icon.resize({ width: 16, height: 16 }));
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Messenger',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip('Messenger');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
      }
    }
  });
}

// App ready
app.whenReady().then(() => {
  createWindow();
  createMenu();
  
  // Create tray on Windows and Linux
  if (process.platform !== 'darwin') {
    createTray();
  }

  app.on('activate', () => {
    // On macOS, re-create window when dock icon is clicked
    if (mainWindow === null) {
      createWindow();
    } else {
      mainWindow.show();
    }
  });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle before-quit for macOS
app.on('before-quit', () => {
  app.isQuitting = true;
});

// Security: Disable navigation to unknown protocols
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
      event.preventDefault();
    }
  });
});
