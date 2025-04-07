import React, { useState, useEffect, useRef } from 'react';
import ApiKeySetup from './components/ApiKeySetup';
import AnalysisArea from './components/AnalysisArea';
import StatusBar from './components/StatusBar';
import SettingsModal from './components/SettingsModal';

const App = () => {
  const [apiKey, setApiKey] = useState('');
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isLoading, setIsLoading] = useState(true);
  const [currentScreenshot, setCurrentScreenshot] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [status, setStatus] = useState('Starting...');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isIgnoringMouse, setIsIgnoringMouse] = useState(false);
  
  // Ref to access AnalysisArea methods
  const analysisAreaRef = useRef(null);

  const MOVE_STEP = 10;
  const MOVE_STEP_HIGHER = 50;

  // Initialize app
  useEffect(() => {
    const init = async () => {
      try {
        // Get API key from electron-store
        const savedApiKey = await window.api.getApiKey();
        setApiKey(savedApiKey || '');
        setStatus(savedApiKey ? 'Ready' : 'Please set API key');
      } catch (error) {
        setStatus('Error initializing');
        console.error('Initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    init();

    // Set up event listeners for window events
    window.api.onMouseIgnoreChange((isIgnoring) => {
      setIsIgnoringMouse(isIgnoring);
      setStatus(isIgnoring ? 'Click-through: ON' : 'Click-through: OFF');
    });

    window.api.onScreenshotTaken((path) => {
      console.log('Screenshot captured');
      setCurrentScreenshot(path);
      setStatus('Screenshot captured');
    });

    // Register event handler reference for trigger-analysis
    window.api.onTriggerAnalysis((screenshotPath) => {
      console.log('Trigger analysis event received in React with path:', screenshotPath);
      
      // If a screenshot path is provided from main process, update our state
      if (screenshotPath && screenshotPath !== currentScreenshot) {
        console.log('Updating screenshot path from main process:', screenshotPath);
        setCurrentScreenshot(screenshotPath);
      }
      
      // Small delay to ensure state is updated
      setTimeout(() => handleTriggerAnalysis(), 50);
    });
    
    window.api.onError((message) => {
      setStatus(`Error: ${message}`);
    });
  }, []);

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  useEffect(() => {
    let keyMoveTimer = null;

    let lastKeyMoveTime = 0;
    const keyMoveThrottle = 16; // 60FPS
    const handleKeyDown = (e) => {
      // Check for Enter shortcut with Command/Control key for OpenAI generation
      const isModifierPressed = e.metaKey || e.ctrlKey;

      // Check for settings toggle with comma key
      if (isModifierPressed && (e.key === ',' || e.key === '<')) {
        e.preventDefault();
        toggleSettings();
        return;
      }

      // Not handling capturing screenshot here.
      if (isModifierPressed && (e.key === 's' || e.key === 'S')) {
        return;
      }

      // If settings are open, don't process other shortcuts
      if (isSettingsOpen && e.key === 'Escape') {
        return;
      }

      if (isModifierPressed) {
        if (e.key === 'Enter') {
          e.preventDefault();

          const generateButton = document.getElementById('analyze-btn');
          if (generateButton && !generateButton.disabled) {
            generateButton.click();
            return;
          }
        }
      }

      // For non-special shortcuts, skip if in text input
      if (e.target.tagName === 'INPUT' ||
          e.target.tagName === 'TEXTAREA') {
        // Only proceed with arrow keys and other navigation shortcuts
        if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
          return;
        }
      }

      if (isModifierPressed && ['ArrowUp', 'ArrowDown'].includes(e.key)) {
        const responseSection = document.querySelector('.response-section');
        if (responseSection) {
          // In Electron, we need to specifically check if we should handle scrolling
          // by checking if the response section is focusable and visible
          if (document.activeElement === responseSection || responseSection.contains(document.activeElement)) {
            // If response section is focused or contains the focus, let it handle scrolling
            return;
          }

          // If solution is visible but not focused, focus it and let it handle scrolling
          if (window.getComputedStyle(responseSection).display !== 'none') {
            responseSection.focus();
            return;
          }
        }
      }

      const now = Date.now();
      if (now - lastKeyMoveTime < keyMoveThrottle) {
        return; // Throttle movement
      }
      lastKeyMoveTime = now;

      const moveDistance = isModifierPressed ? MOVE_STEP_HIGHER : MOVE_STEP;
      let moved = false;

      switch (e.key) {
        case 'ArrowUp':
          // Only move the window if not using Command+Arrow
          if (!isModifierPressed) {
            e.preventDefault();
            setPosition(prev => ({ ...prev, y: prev.y - moveDistance }));
            moved = true;
          }
          break;
        case 'ArrowDown':
          // Only move the window if not using Command+Arrow
          if (!isModifierPressed) {
            e.preventDefault();
            setPosition(prev => ({ ...prev, y: prev.y + moveDistance }));
            moved = true;
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setPosition(prev => ({ ...prev, x: prev.x - moveDistance }));
          moved = true;
          break;
        case 'ArrowRight':
          e.preventDefault();
          setPosition(prev => ({ ...prev, x: prev.x + moveDistance }));
          moved = true;
          break;
        case ',': // Settings (⌘,)
          if (isModifierPressed) {
            e.preventDefault();
            setIsSettingsOpen(prev => !prev);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (keyMoveTimer) {
        clearTimeout(keyMoveTimer);
      }
    };


  }, [isSettingsOpen, MOVE_STEP, MOVE_STEP_HIGHER]);
  
  // Define trigger analysis handler separately so it always has access to latest state
  const handleTriggerAnalysis = () => {
    console.log('Handling trigger analysis with current state');
    console.log('Current screenshot:', currentScreenshot ? 'EXISTS' : 'NULL');
    console.log('Is analyzing:', isAnalyzing);
    
    // If we have a screenshot and we're not already analyzing, trigger analysis
    if (currentScreenshot && !isAnalyzing) {
      setStatus('⌘+Enter shortcut: Analyzing code with GPT-4o...');
      
      // Brief visual indicator that the shortcut was triggered
      const statusElement = document.querySelector('.status-bar');
      if (statusElement) {
        statusElement.classList.add('shortcut-triggered');
        setTimeout(() => {
          statusElement.classList.remove('shortcut-triggered');
        }, 1000);
      }
      
      // We'll use a ref to access the AnalysisArea component's analyzeCode method
      if (analysisAreaRef.current && analysisAreaRef.current.analyzeCode) {
        console.log('Calling analyzeCode method via ref');
        analysisAreaRef.current.analyzeCode();
      }
    } else {
      console.log('Cannot analyze: ' + (! currentScreenshot ? 'No screenshot taken' : 'Already analyzing'));
      
      setStatus(!currentScreenshot ? 
        'Take a screenshot first (⌘+H)' : 
        'Already analyzing...');
    }
  };

  const saveApiKey = async (key) => {
    try {
      await window.api.saveApiKey(key);
      setApiKey(key);
      setStatus('API key saved successfully');
    } catch (error) {
      setStatus('Failed to save API key');
      console.error('API key save error:', error);
    }
  };

  const takeScreenshot = async () => {
    setStatus('Taking screenshot...');
    try {
      await window.api.takeScreenshot();
    } catch (error) {
      setStatus('Screenshot failed');
      console.error('Screenshot error:', error);
    }
  };

  // Status update handler that can be passed to child components
  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
  };
  
  // For screenshot handling
  const handleScreenshot = async () => {
    setStatus('Taking screenshot...');
    try {
      await window.api.takeScreenshot();
    } catch (error) {
      setStatus('Screenshot failed');
      console.error('Screenshot error:', error);
    }
  };

  return (
    <div className="app-container">
      <div className={`mouse-overlay ${isIgnoringMouse ? 'active' : ''}`}>
        Click-through mode active
      </div>
      
      <StatusBar 
        status={status}
        isIgnoringMouse={isIgnoringMouse}
        onSettingsClick={() => setIsSettingsOpen(true)}
      />

      {!apiKey ? (
        <ApiKeySetup onSave={saveApiKey} />
      ) : (
        <AnalysisArea 
          ref={analysisAreaRef}
          screenshot={currentScreenshot}
          isAnalyzing={isAnalyzing}
          onScreenshot={handleScreenshot}
          onStatusChange={handleStatusChange}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal 
          apiKey={apiKey}
          onSave={saveApiKey}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
