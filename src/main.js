const { app, BrowserWindow, globalShortcut, ipcMain, dialog, screen } = require('electron');
const path = require('path');
// Import electron-store
const Store = require('electron-store').default || require('electron-store');
const screenshot = require('screenshot-desktop');
const { fileURLToPath } = require('url');
const fs = require('fs');
const os = require('os');

const isDev = process.env.NODE_ENV === 'development';

// Import OpenAI service
const OpenAIService = require('./openai-service');
let openaiService = null;

// Initialize store for settings
const store = new Store({
  encryptionKey: 'your-encryption-key', // Use a more secure key in production
  schema: {
    apiKey: {
      type: 'string',
      default: ''
    }
  }
});

// Keep a global reference of the window object to prevent garbage collection
let mainWindow;

// Track the state of mouse events (click-through mode)
let isIgnoringMouseEvents = false;

// Track the latest screenshot path
let latestScreenshotPath = null;

// Add logs for uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error("[ERROR] Uncaught Exception:", err)
});

// Log unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('[ERROR] Unhandled rejection at:', promise, 'reason:', reason);
});

// Create temporary directory for screenshots
const tmpDir = path.join(os.tmpdir(), 'codesolve');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

function createWindow() {
  // Create the browser window with specific settings for invisibility to screen recording
  console.log("[WINDOW] Creating the main window");

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    transparent: true,
    frame: false,
    vibrancy: 'under-window', // macOS-specific vibrancy setting
    hasShadow: false,
    alwaysOnTop: true,
    movable: true,
    resizable: true,
    skipTaskbar: true,
    backgroundColor: '#00000000',
    titleBarStyle: 'hidden',
    title: "",
    roundedCorners: false,
    opacity: 0.98,
    useContentSize: true,
    fullscreenable: false,
    visualEffectState: 'followWindow',
    renderCorners: false,
    paintWhenInitiallyHidden: true,
    minimizable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: true,
      backgroundThrottling: false,
      devTools: true
    }
  });

  console.log("[WINDOW] Browser window created.");

  const startingUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`

  require('@electron/remote/main').initialize();

  console.log(`[WINDOW] loading URL: ${startingUrl}`);

  mainWindow.loadURL(startingUrl).then(() => {
    console.log("[WINDOW] Loaded URL:", startingUrl);
  }).catch(err => {
    console.log("[ERROR] Something wrong happened while loading URL:", startingUrl);
    console.error("[ERROR]", err);
  });

  require('@electron/remote/main').enable(mainWindow.webContents);

  // Prevent window from appearing in Mission Control
  mainWindow.setAutoHideMenuBar(true);
  mainWindow.setWindowButtonVisibility(false);
  mainWindow.setContentProtection(true);
  console.log('[WINDOW] Content protection enabled');

  mainWindow.setAlwaysOnTop(true, 'screen-saver', 1);

  // Hide from dock completely
  app.dock.hide();

  // Additional macOS-specific settings
  mainWindow.setVisibleOnAllWorkspaces(true, {
    visibleOnFullScreen: true,
    skipTransformProcessType: true,
  });

  mainWindow.on('ready-to-show', () => {
      console.log('[WINDOW] Window is ready to show');
  })

  mainWindow.webContents.on('did-start-loading', () => {
      console.log('[WINDOW] Window started loading');
  });

  mainWindow.webContents.on('did-finish-load', () => {
      console.log('[WINDOW] Window finished loading');
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error(`[WINDOW] did-fail-load: ${errorDescription} (${errorCode})`);
  });

  mainWindow.webContents.on('crashed', (event, killed) => {
    console.error(`[WINDOW] Renderer process ${killed ? 'was killed' : 'crashed'}`);
  });


  const ensureOnTop = () => {
    if (process.platform === 'darwin') {
      mainWindow.setAlwaysOnTop(true, 'screen-saver', 1)
    }
  };

  try {
    const display = screen.getPrimaryDisplay();

    // Place the window in a position less likely to be captured by OBS
    mainWindow.setPosition(0, 0);

    // Use opacity to make it harder for OBS to detect
    mainWindow.setOpacity(0.95);

    // Set window size to make it more likely to be seen as a system UI element
    mainWindow.setBounds({
      x: display.bounds.width / 4,
      y: display.bounds.height / 4,
      width: display.bounds.width / 2,
      height: display.bounds.height / 2
    });
  } catch (e) {
    console.error('Error configuring OBS invisibility:', e);
  }

  // Load the index.html of the app
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Make window click-through when needed
  mainWindow.setIgnoreMouseEvents(false); // Will toggle with shortcut

  // Open DevTools in development
  if (isDev && process.env.OPEN_DEV_TOOLS === 'true') {
    console.log('[WINDOW] Opening DevTools');
    mainWindow.webContents.openDevTools({mode: 'detach'});
  }

  // Set window to always be on top
  mainWindow.setAlwaysOnTop(true, 'floating');
  mainWindow.setVisibleOnAllWorkspaces(true);
  mainWindow.setFullScreenable(false);

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  // Register global shortcuts
  registerShortcuts();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) createWindow();
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Register keyboard shortcuts
function registerShortcuts() {
  console.log("[SHORTCUTS] Registering global shortcuts");

  const moveWindow = (() => {
    let lastMoveTime = 0;
    const moveThrottle = 16; // 60 FPS

    return (x, y) => {
      const now = Date.now();
      if (mainWindow && (now - lastMoveTime) > moveThrottle) {
        lastMoveTime = now;
        mainWindow.setBounds({
          ...mainWindow.getBounds(),
          x,
          y,
        });
      }
    }
  })();

  globalShortcut.register('CommandOrControl+Option+Up', () => {
    if (mainWindow) {
      const [x, y] = mainWindow.getPosition();
      moveWindow(x, y - 50);
    }
  });

  globalShortcut.register('CommandOrControl+Option+Down', () => {
    if (mainWindow) {
      const [x, y] = mainWindow.getPosition();
      moveWindow(x, y + 50);
    }
  });

  globalShortcut.register('CommandOrControl+Option+Left', () => {
    if (mainWindow) {
      const [x, y] = mainWindow.getPosition();
      moveWindow(x - 50, y);
    }
  });

  globalShortcut.register('CommandOrControl+Option+Right', () => {
    if (mainWindow) {
      const [x, y] = mainWindow.getPosition();
      moveWindow(x + 50, y);
    }
  });

  // Screenshot capture shortcut (Cmd+S)
  globalShortcut.register('CommandOrControl+S', async () => {
    await takeScreenshot();
  });

  // Analysis trigger shortcut (Cmd+Enter)
  globalShortcut.register('CommandOrControl+Enter', () => {
    if (mainWindow) {
      console.log("[SHORTCUTS] Cmd+Enter pressed: Triggering code analysis");
      console.log('Cmd+Enter pressed: Triggering code analysis');
      
      // Get the current screenshot path from the main process
      console.log('Current screenshot path:', latestScreenshotPath);
      
      // Send the event and the current screenshot path to ensure syncing
      mainWindow.webContents.send('trigger-analysis', latestScreenshotPath);
      
      // Briefly flash the window to provide visual feedback
      if (!mainWindow.isVisible()) {
        mainWindow.show();
      }
      
      // Focus the window to ensure it receives the event
      mainWindow.focus();
    }
  });
  
  // Scroll down shortcut (Cmd+Shift+Down)
  globalShortcut.register('CommandOrControl+Shift+Down', () => {
    if (mainWindow) {
      console.log('Cmd+Shift+Down: Scrolling down');
      mainWindow.webContents.send('scroll-analysis', 'down');
      // Don't focus the window to keep current app focus
    }
  });
  
  // Scroll up shortcut (Cmd+Shift+Up)
  globalShortcut.register('CommandOrControl+Shift+Up', () => {
    if (mainWindow) {
      console.log('Cmd+Shift+Up: Scrolling up');
      mainWindow.webContents.send('scroll-analysis', 'up');
      // Don't focus the window to keep current app focus
    }
  });
  
  // Page down shortcut (Cmd+Shift+PageDown)
  globalShortcut.register('CommandOrControl+Shift+PageDown', () => {
    if (mainWindow) {
      mainWindow.webContents.send('scroll-analysis', 'pagedown');
    }
  });
  
  // Page up shortcut (Cmd+Shift+PageUp)
  globalShortcut.register('CommandOrControl+Shift+PageUp', () => {
    if (mainWindow) {
      mainWindow.webContents.send('scroll-analysis', 'pageup');
    }
  });

  // Toggle window visibility
  globalShortcut.register('CommandOrControl+B', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
      }
    }
  });

  // Toggle click-through mode
  globalShortcut.register('CommandOrControl+Shift+C', () => {
    if (mainWindow) {
      // Toggle the state using our tracked variable
      isIgnoringMouseEvents = !isIgnoringMouseEvents;
      
      // Apply the new state
      mainWindow.setIgnoreMouseEvents(isIgnoringMouseEvents);
      
      // Notify the renderer about the change
      mainWindow.webContents.send('mouse-ignore-change', isIgnoringMouseEvents);
      
      console.log('Click-through mode toggled:', isIgnoringMouseEvents ? 'ON' : 'OFF');
    }
  });
}

// Take a screenshot
async function takeScreenshot() {
  try {
    const timestamp = Date.now();
    const screenshotPath = path.join(tmpDir, `screenshot-${timestamp}.png`);
    
    // Take screenshot
    await screenshot({ filename: screenshotPath });
    
    // Save the latest screenshot path to the global variable
    latestScreenshotPath = screenshotPath;
    console.log('Screenshot saved to:', latestScreenshotPath);
    
    // Send screenshot path to renderer
    if (mainWindow) {
      mainWindow.webContents.send('screenshot-taken', screenshotPath);
      mainWindow.show(); // Ensure window is visible
    }
    
    return screenshotPath;
  } catch (error) {
    console.error('Screenshot error:', error);
    if (mainWindow) {
      mainWindow.webContents.send('error', 'Failed to take screenshot');
    }
    return null;
  }
}

// Handle IPC messages from renderer
ipcMain.handle('get-api-key', () => {
  return store.get('apiKey', '');
});

ipcMain.handle('save-api-key', (event, apiKey) => {
  store.set('apiKey', apiKey);
  
  // Initialize or update OpenAI service with the new API key
  if (!openaiService) {
    openaiService = new OpenAIService(apiKey);
  } else {
    openaiService.setApiKey(apiKey);
  }
  
  return true;
});

ipcMain.handle('take-screenshot', async () => {
  return await takeScreenshot();
});

// Handle code analysis with OpenAI
ipcMain.handle('analyze-code', async (event, screenshotPath) => {
  try {
    const apiKey = store.get('apiKey');
    if (!apiKey) {
      throw new Error('API key not found. Please set up your OpenAI API key in settings.');
    }
    
    // Initialize OpenAI service if not already done
    if (!openaiService) {
      openaiService = new OpenAIService(apiKey);
    }
    
    // Analyze the code from the screenshot
    return await openaiService.analyzeCodeFromScreenshot(screenshotPath);
  } catch (error) {
    console.error('Error analyzing code:', error);
    throw error;
  }
});

// Window control handlers
ipcMain.handle('minimize-window', () => {
  if (mainWindow) {
    mainWindow.minimize();
    return true;
  }
  return false;
});

ipcMain.handle('close-window', () => {
  if (mainWindow) {
    mainWindow.close();
    return true;
  }
  return false;
});

ipcMain.handle('toggleClickthrough', () => {
  if (mainWindow) {
    // Toggle the state using our tracked variable
    isIgnoringMouseEvents = !isIgnoringMouseEvents;
    
    // Apply the new state
    mainWindow.setIgnoreMouseEvents(isIgnoringMouseEvents);
    
    // Notify the renderer
    mainWindow.webContents.send('mouse-ignore-change', isIgnoringMouseEvents);
    
    return isIgnoringMouseEvents;
  }
  return false;
});

ipcMain.handle('show-window', () => {
  if (mainWindow) {
    mainWindow.show();
    return true;
  }
  return false;
});

ipcMain.handle('hide-window', () => {
  if (mainWindow) {
    mainWindow.hide();
    return true;
  }
  return false;
});

// Clean up on app exit
app.on('will-quit', () => {
  // Unregister all shortcuts
  globalShortcut.unregisterAll();
  
  // Clean up temporary files
  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch (error) {
    console.error('Error cleaning up temporary files:', error);
  }
});
