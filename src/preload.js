const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'api', {
    // API key management
    getApiKey: () => ipcRenderer.invoke('get-api-key'),
    saveApiKey: (apiKey) => ipcRenderer.invoke('save-api-key', apiKey),
    
    // Screenshot functionality
    takeScreenshot: () => ipcRenderer.invoke('take-screenshot'),
    
    // OpenAI code analysis
    analyzeCode: (screenshotPath) => ipcRenderer.invoke('analyze-code', screenshotPath),
    
    // Window controls
    minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
    closeWindow: () => ipcRenderer.invoke('close-window'),
    toggleClickthrough: () => ipcRenderer.invoke('toggle-clickthrough'),
    showWindow: () => ipcRenderer.invoke('show-window'),
    hideWindow: () => ipcRenderer.invoke('hide-window'),
    
    // Listeners
    onScreenshotTaken: (callback) => {
      ipcRenderer.on('screenshot-taken', (event, screenshotPath) => callback(screenshotPath));
    },
    onTriggerAnalysis: (callback) => {
      ipcRenderer.on('trigger-analysis', (event, screenshotPath) => callback(screenshotPath));
    },
    onMouseIgnoreChange: (callback) => {
      ipcRenderer.on('mouse-ignore-change', (event, isIgnoring) => callback(isIgnoring));
    },
    onError: (callback) => {
      ipcRenderer.on('error', (event, message) => callback(message));
    },
    
    // Remove listeners (to avoid memory leaks)
    removeAllListeners: () => {
      ipcRenderer.removeAllListeners('screenshot-taken');
      ipcRenderer.removeAllListeners('trigger-analysis');
      ipcRenderer.removeAllListeners('mouse-ignore-change');
      ipcRenderer.removeAllListeners('error');
    }
  }
);
