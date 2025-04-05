import React, { useState } from 'react';

const SettingsModal = ({ apiKey, onSave, onClose }) => {
  const [newApiKey, setNewApiKey] = useState(apiKey);
  const [activeTab, setActiveTab] = useState('api'); // Default active tab
  const [showApiKey, setShowApiKey] = useState(false); // State to track API key visibility

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newApiKey.trim()) {
      onSave(newApiKey.trim());
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && onClose()}>
      <div className="modal-content settings-modal">
        <div className="modal-header">
          <h2><span className="settings-icon">⚙️</span> Settings</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="settings-tabs">
          <button 
            className={`tab-button ${activeTab === 'api' ? 'active' : ''}`}
            onClick={() => setActiveTab('api')}
          >
            <span className="tab-icon">🔑</span> API Key
          </button>
          <button 
            className={`tab-button ${activeTab === 'shortcuts' ? 'active' : ''}`}
            onClick={() => setActiveTab('shortcuts')}
          >
            <span className="tab-icon">⌨️</span> Shortcuts
          </button>
          <button 
            className={`tab-button ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            <span className="tab-icon">ℹ️</span> About
          </button>
        </div>
        
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            {activeTab === 'api' && (
              <div className="tab-content">
                <div className="form-group api-key-group">
                  <div className="input-header">
                    <label htmlFor="apiKeyInput">OpenAI API Key</label>
                    <small className="api-help">Required for code analysis with GPT-4o</small>
                  </div>
                  
                  <div className="api-input-container">
                    <span className="input-icon">🔐</span>
                    <input
                      id="apiKeyInput"
                      type={showApiKey ? "text" : "password"}
                      value={newApiKey}
                      onChange={(e) => setNewApiKey(e.target.value)}
                      placeholder="sk-..."
                      className="api-key-input"
                    />
                    <button 
                      type="button"
                      className="reveal-button" 
                      onClick={() => setShowApiKey(!showApiKey)}
                      aria-label={showApiKey ? "Hide API key" : "Show API key"}
                    >
                      {showApiKey ? "👁️‍🗨️" : "👁️"}
                    </button>
                  </div>
                  
                  <div className="api-info">
                    <span className="info-icon">ℹ️</span>
                    <span className="info-text">
                      Your API key is stored locally and never sent to our servers.
                      <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="api-link">
                        Get an API key
                      </a>
                    </span>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button type="submit" className="primary-btn save-btn">
                    <span className="btn-icon">💾</span> Save API Key
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'shortcuts' && (
              <div className="tab-content shortcuts-tab">
                <div className="shortcut-group">
                  <h3 className="shortcut-title">Capture & Analysis</h3>
                  <div className="shortcut-card">
                    <span className="shortcut-icon">📸</span>
                    <div className="shortcut-info">
                      <div className="shortcut-key">⌘ + H</div>
                      <div className="shortcut-desc">Take a screenshot</div>
                    </div>
                  </div>
                  
                  <div className="shortcut-card">
                    <span className="shortcut-icon">🔍</span>
                    <div className="shortcut-info">
                      <div className="shortcut-key">⌘ + Enter</div>
                      <div className="shortcut-desc">Analyze code with GPT-4o</div>
                    </div>
                  </div>
                </div>
                
                <div className="shortcut-group">
                  <h3 className="shortcut-title">Window Controls</h3>
                  <div className="shortcut-card">
                    <span className="shortcut-icon">👁️</span>
                    <div className="shortcut-info">
                      <div className="shortcut-key">⌘ + Shift + Space</div>
                      <div className="shortcut-desc">Toggle window visibility</div>
                    </div>
                  </div>
                  
                  <div className="shortcut-card">
                    <span className="shortcut-icon">👆</span>
                    <div className="shortcut-info">
                      <div className="shortcut-key">⌘ + Shift + C</div>
                      <div className="shortcut-desc">Toggle click-through mode</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'about' && (
              <div className="tab-content about-tab">
                <div className="about-logo">
                  <div className="app-logo">✨ CodeSolve</div>
                  <div className="app-version">Version 1.0.0</div>
                </div>
                
                <div className="about-description">
                  <p>CodeSolve is a tool for analyzing code with GPT-4o.</p>
                  <p>It's designed to be invisible to screen recording software while providing powerful AI-assisted code analysis.</p>
                </div>
                
                <div className="about-features">
                  <h4>Features</h4>
                  <ul>
                    <li>✅ Screen recording invisibility</li>
                    <li>✅ Click-through capability</li>
                    <li>✅ Code screenshot capturing</li>
                    <li>✅ GPT-4o code analysis</li>
                    <li>✅ Markdown rendering of results</li>
                  </ul>
                </div>
              </div>
            )}
            
            {activeTab !== 'api' && (
              <div className="form-actions">
                <button type="button" className="secondary-btn" onClick={onClose}>Close</button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
