import React, { useState, forwardRef, useImperativeHandle } from 'react';

const AnalysisArea = forwardRef(({ 
  screenshot, 
  isAnalyzing: externalIsAnalyzing,
  onScreenshot, 
  onStatusChange 
}, ref) => {
  const [isAnalyzing, setIsAnalyzing] = useState(externalIsAnalyzing);
  const [analysisResult, setAnalysisResult] = useState('');
  const [error, setError] = useState(null);
  
  // Expose the analyzeCode method to parent components via ref
  useImperativeHandle(ref, () => ({
    analyzeCode
  }));

  // Analyze code using OpenAI API
  const analyzeCode = async () => {
    if (!screenshot || isAnalyzing) return;
    
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult('');
    onStatusChange && onStatusChange('Analyzing code...');
    
    try {
      // Call the OpenAI API through our preload bridge
      const response = await window.api.analyzeCode(screenshot);
      
      if (response && response.choices && response.choices.length > 0) {
        const content = response.choices[0].message.content;
        setAnalysisResult(content);
        onStatusChange && onStatusChange('Analysis complete');
      } else {
        throw new Error('Invalid response from OpenAI');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze code');
      onStatusChange && onStatusChange(`Error: ${err.message || 'Failed to analyze code'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="analysis-area">
      <div className="screenshot-section">
        <h3>Code Screenshot</h3>
        
        <div className="screenshot-container">
          {screenshot ? (
            <img 
              src={`file://${screenshot}`} 
              alt="Code screenshot" 
              className="screenshot-preview" 
            />
          ) : (
            <div className="screenshot-placeholder">
              No screenshot taken yet
            </div>
          )}
        </div>
        
        <div className="action-buttons">
          <button 
            className="primary-btn" 
            onClick={onScreenshot}
          >
            Capture Screenshot
          </button>
          
          <button 
            className="primary-btn" 
            onClick={analyzeCode}
            disabled={!screenshot || isAnalyzing}
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Code'}
          </button>
        </div>
      </div>
      
      <div className="result-section">
        <h3>Analysis Result</h3>
        
        <div className="result-container">
          {isAnalyzing ? (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <p>Analyzing your code with GPT-4o...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <p>Error: {error}</p>
            </div>
          ) : analysisResult ? (
            <div className="result-content">
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {analysisResult}
              </pre>
            </div>
          ) : (
            <div className="result-placeholder">
              Take a screenshot and click "Analyze Code" to get results from GPT-4o
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default AnalysisArea;
