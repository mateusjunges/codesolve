import React from 'react';

const StatusBar = ({ status, isIgnoringMouse, onSettingsClick }) => {
  return (
    <div className="status-bar">
      <div className="status-message">
        {status}
      </div>
      
      <div className="status-buttons">
        <div className={`mouse-indicator ${isIgnoringMouse ? 'active' : ''}`}>
          {isIgnoringMouse ? 'Click-through' : 'Normal mode'}
        </div>
        
        <button 
          className="icon-button settings-button" 
          onClick={onSettingsClick}
          title="Settings"
        >
          ⚙️
        </button>
        
        <button 
          className="icon-button minimize-button" 
          onClick={() => window.api.minimizeWindow()}
          title="Minimize"
        >
          −
        </button>
        
        <button 
          className="icon-button close-button" 
          onClick={() => window.api.closeWindow()}
          title="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default StatusBar;
