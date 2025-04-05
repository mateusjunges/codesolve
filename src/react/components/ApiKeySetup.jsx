import React, { useState } from 'react';

const ApiKeySetup = ({ onSave }) => {
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onSave(apiKey.trim());
    }
  };

  return (
    <div className="api-key-setup">
      <h2>Welcome to CodeSolve</h2>
      <p>Enter your API key to get started:</p>
      
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key"
            required
          />
        </div>
        
        <button 
          type="submit" 
          className="primary-btn"
          disabled={!apiKey.trim()}
        >
          Save API Key
        </button>
      </form>
    </div>
  );
};

export default ApiKeySetup;
