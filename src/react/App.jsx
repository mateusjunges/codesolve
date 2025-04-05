import React, { useState, useEffect, useRef } from 'react';
import ApiKeySetup from './components/ApiKeySetup';
import AnalysisArea from './components/AnalysisArea';
import StatusBar from './components/StatusBar';
import SettingsModal from './components/SettingsModal';

const App = () => {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentScreenshot, setCurrentScreenshot] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [status, setStatus] = useState('Starting...');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isIgnoringMouse, setIsIgnoringMouse] = useState(false);
  
  // Ref to access AnalysisArea methods
  const analysisAreaRef = useRef(null);

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
      setCurrentScreenshot(path);
      setStatus('Screenshot captured');
    });

    // Listen for Cmd+Enter shortcut
    window.api.onTriggerAnalysis(() => {
      // If we have a screenshot and we're not already analyzing, trigger analysis
      if (currentScreenshot && !isAnalyzing) {
        setStatus('Shortcut triggered: Analyzing code...');
        // We'll use a ref to access the AnalysisArea component's analyzeCode method
        if (analysisAreaRef.current && analysisAreaRef.current.analyzeCode) {
          analysisAreaRef.current.analyzeCode();
        }
      }
    });

    window.api.onError((message) => {
      setStatus(`Error: ${message}`);
    });
  }, []);

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
