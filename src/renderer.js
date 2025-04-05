// DOM Elements
const apiKeySetup = document.getElementById('apiKeySetup');
const analysisArea = document.getElementById('analysisArea');
const apiKeyInput = document.getElementById('apiKeyInput');
const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
const screenshotPlaceholder = document.getElementById('screenshotPlaceholder');
const screenshotPreview = document.getElementById('screenshotPreview');
const captureBtn = document.getElementById('captureBtn');
const analyzeBtn = document.getElementById('analyzeBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const resultContent = document.getElementById('resultContent');
const statusMessage = document.getElementById('statusMessage');
const mouseMode = document.getElementById('mouseMode');
const settingsBtn = document.getElementById('settingsBtn');
const minimizeBtn = document.getElementById('minimizeBtn');
const closeBtn = document.getElementById('closeBtn');
const settingsModal = document.getElementById('settingsModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const apiKeyUpdateInput = document.getElementById('apiKeyUpdateInput');
const updateApiKeyBtn = document.getElementById('updateApiKeyBtn');

// State variables
let currentScreenshotPath = null;
let isAnalyzing = false;

// Initialize app
async function initApp() {
  // Check if API key is already set
  const apiKey = await window.api.getApiKey();
  if (apiKey) {
    apiKeySetup.classList.add('hidden');
    analysisArea.classList.remove('hidden');
    updateStatus('Ready');
  }

  // Set up event listeners
  setupEventListeners();
}

// Set up event listeners
function setupEventListeners() {
  // API key setup
  saveApiKeyBtn.addEventListener('click', saveApiKey);
  
  // Screenshot controls
  captureBtn.addEventListener('click', captureScreenshot);
  analyzeBtn.addEventListener('click', analyzeCode);
  
  // Window controls
  minimizeBtn.addEventListener('click', () => {
    updateStatus('Window minimized');
  });
  
  closeBtn.addEventListener('click', () => {
    window.close();
  });
  
  // Settings
  settingsBtn.addEventListener('click', () => {
    openSettings();
  });
  
  closeModalBtn.addEventListener('click', () => {
    settingsModal.classList.add('hidden');
  });
  
  updateApiKeyBtn.addEventListener('click', updateApiKey);
  
  // IPC event listeners
  window.api.onScreenshotTaken((path) => {
    handleScreenshotTaken(path);
  });
  
  window.api.onTriggerAnalysis(() => {
    if (currentScreenshotPath && !isAnalyzing) {
      analyzeCode();
    }
  });
  
  window.api.onMouseIgnoreChange((isIgnoring) => {
    mouseMode.textContent = isIgnoring ? 'Click-Through Mode' : 'Interactive Mode';
  });
  
  window.api.onError((message) => {
    updateStatus(`Error: ${message}`, true);
  });
  
  // Close settings when clicking outside
  window.addEventListener('click', (event) => {
    if (event.target === settingsModal) {
      settingsModal.classList.add('hidden');
    }
  });
}

// Save API key
async function saveApiKey() {
  const apiKey = apiKeyInput.value.trim();
  if (!apiKey) {
    updateStatus('Please enter a valid API key', true);
    return;
  }
  
  try {
    await window.api.saveApiKey(apiKey);
    apiKeySetup.classList.add('hidden');
    analysisArea.classList.remove('hidden');
    updateStatus('API key saved successfully');
  } catch (error) {
    updateStatus('Failed to save API key', true);
    console.error(error);
  }
}

// Update API key
async function updateApiKey() {
  const apiKey = apiKeyUpdateInput.value.trim();
  if (!apiKey) {
    updateStatus('Please enter a valid API key', true);
    return;
  }
  
  try {
    await window.api.saveApiKey(apiKey);
    settingsModal.classList.add('hidden');
    updateStatus('API key updated successfully');
  } catch (error) {
    updateStatus('Failed to update API key', true);
    console.error(error);
  }
}

// Capture screenshot
async function captureScreenshot() {
  updateStatus('Taking screenshot...');
  try {
    await window.api.takeScreenshot();
  } catch (error) {
    updateStatus('Failed to capture screenshot', true);
    console.error(error);
  }
}

// Handle screenshot taken
function handleScreenshotTaken(path) {
  currentScreenshotPath = path;
  screenshotPlaceholder.classList.add('hidden');
  screenshotPreview.src = `file://${path}`;
  screenshotPreview.classList.remove('hidden');
  analyzeBtn.disabled = false;
  updateStatus('Screenshot captured');
}

// Analyze code using OpenAI API
async function analyzeCode() {
  if (!currentScreenshotPath || isAnalyzing) return;
  
  isAnalyzing = true;
  analyzeBtn.disabled = true;
  resultContent.innerHTML = '';
  loadingIndicator.classList.remove('hidden');
  updateStatus('Analyzing code...');
  
  try {
    // Read the image file as base64
    const imageData = await readImageFile(currentScreenshotPath);
    
    // Get API key
    const apiKey = await window.api.getApiKey();
    if (!apiKey) {
      throw new Error('API key not found');
    }
    
    // Prepare request to OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a coding assistant that helps developers solve issues in their code. You will receive a screenshot of code and your task is to identify potential issues, explain them, and provide solutions. Format your responses using Markdown with code blocks for solutions.'
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Please analyze this code and help me resolve any issues:' },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${imageData}`
                }
              }
            ]
          }
        ],
        max_tokens: 4000
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to get response from OpenAI');
    }
    
    const data = await response.json();
    const analysis = data.choices[0]?.message?.content || 'No analysis available';
    
    // Display formatted analysis
    renderMarkdown(analysis);
    updateStatus('Analysis complete');
  } catch (error) {
    updateStatus(`Analysis failed: ${error.message}`, true);
    resultContent.innerHTML = `<div class="error">Error: ${error.message}</div>`;
    console.error('Analysis error:', error);
  } finally {
    loadingIndicator.classList.add('hidden');
    isAnalyzing = false;
    analyzeBtn.disabled = false;
  }
}

// Read image file as base64
function readImageFile(filePath) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      // Get base64 data without the data URL prefix
      const base64Data = canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
      resolve(base64Data);
    };
    
    img.onerror = function() {
      reject(new Error('Failed to load image'));
    };
    
    img.src = `file://${filePath}`;
  });
}

// Render markdown with syntax highlighting
function renderMarkdown(markdown) {
  // Simple markdown parser (for production, use a proper markdown library)
  let html = markdown
    // Handle headers
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    // Handle bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Handle italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Handle lists
    .replace(/^\s*-\s(.*$)/gm, '<li>$1</li>');
  
  // Replace lists with proper HTML
  html = html.replace(/<li>.*?<\/li>/gs, match => `<ul>${match}</ul>`);
  
  // Handle code blocks with language support for Prism.js
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, language, code) => {
    const lang = language || 'javascript';
    const highlightedCode = Prism.highlight(
      code.trim(),
      Prism.languages[lang] || Prism.languages.javascript,
      lang
    );
    return `<pre><code class="language-${lang}">${highlightedCode}</code></pre>`;
  });
  
  // Handle inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Handle paragraphs
  html = html.replace(/^(?!<[h|u|p|l])(.*$)/gm, '<p>$1</p>');
  
  resultContent.innerHTML = html;
}

// Open settings modal
function openSettings() {
  settingsModal.classList.remove('hidden');
  window.api.getApiKey().then(key => {
    apiKeyUpdateInput.value = key || '';
  });
}

// Update status message
function updateStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.style.color = isError ? 'var(--error-color)' : 'var(--text-color)';
  
  // Auto-clear error messages after 5 seconds
  if (isError) {
    setTimeout(() => {
      statusMessage.textContent = 'Ready';
      statusMessage.style.color = 'var(--text-color)';
    }, 5000);
  }
}

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', initApp);
