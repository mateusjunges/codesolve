import React, { useState } from 'react';

const SettingsModal = ({ apiKey, onSave, onClose }) => {
  const [newApiKey, setNewApiKey] = useState(apiKey);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newApiKey.trim()) {
      onSave(newApiKey.trim());
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Settings</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="apiKeyInput">API Key</label>
              <input
                id="apiKeyInput"
                type="password"
                value={newApiKey}
                onChange={(e) => setNewApiKey(e.target.value)}
                placeholder="Update your API key"
              />
            </div>
            
            <div className="form-group">
              <h3>Keyboard Shortcuts</h3>
              <ul className="shortcuts-list">
                <li><strong>Cmd+H</strong>: Take a screenshot</li>
                <li><strong>Cmd+Enter</strong>: Analyze code</li>
                <li><strong>Cmd+Shift+Space</strong>: Toggle visibility</li>
                <li><strong>Cmd+Shift+C</strong>: Toggle click-through mode</li>
              </ul>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="primary-btn">Update Settings</button>
              <button type="button" className="secondary-btn" onClick={onClose}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
