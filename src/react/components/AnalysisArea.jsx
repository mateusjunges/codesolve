import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const AnalysisArea = forwardRef(({ 
  screenshot, 
  isAnalyzing: externalIsAnalyzing,
  onScreenshot, 
  onStatusChange 
}, ref) => {
  const [isAnalyzing, setIsAnalyzing] = useState(externalIsAnalyzing);
  const [analysisResult, setAnalysisResult] = useState('');
  const [formattedResult, setFormattedResult] = useState([]);
  const [error, setError] = useState(null);
  const resultSectionRef = useRef(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const responseSectionRef = useRef(null);

  
  // Function to render markdown with code highlighting
  const renderMarkdown = (text) => {
    if (! text) return '';

    return text;
  };

  useEffect(() => {
    if (! analysisResult) {
      setFormattedResult([]);
      return;
    }

    const codeBlockRegex = /```(?:(\w+)(?: ?([^\n]+))?)?(?:\n)([\s\S]*?)```/g;
    const responseParts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(analysisResult)) !== null) {
      if (match.index > lastIndex) {
        responseParts.push({
          type: 'text',
          content: analysisResult.substring(lastIndex, match.index),
        });
      }

      let language = match[1] ? match[1].toLowerCase() : 'javascript';

      const langMap = {
        'js': 'javascript',
        'ts': 'typescript',
        'rb': 'ruby',
        'c++': 'cpp',
        'php': 'php',
        'kt': 'kotlin',
        'py': 'python',
        'cs': 'csharp',
        'cpp': 'cpp',
        'java': 'java',
        'go': 'go',
        'sh': 'bash',
        'bash': 'bash',
        'shell': 'bash',
        'json': 'json',
        'html': 'html',
        'xml': 'xml',
        'md': 'markdown',
        'yaml': 'yaml',
        'sql': 'sql',
        'css': 'css',
        'yml': 'yaml',
        'markdown': 'markdown'
      }

      language = langMap[language] || language;

      responseParts.push({
        type: 'code',
        language: language,
        title: match[2] || '',
        content: match[3],
      });

      lastIndex = match.index + match[0].length;
    }


    if (lastIndex < analysisResult.length) {
      responseParts.push({
        type: 'text',
        content: analysisResult.substring(lastIndex),
      })
    }

    setFormattedResult(responseParts);
  }, [analysisResult]);

  // Expose the analyzeCode method to parent components via ref
  useImperativeHandle(ref, () => ({
    analyzeCode
  }));
  
  // Listen for both local keyboard events and global shortcuts from main process
  useEffect(() => {
    // Skip if no analysis results to scroll
    if (!analysisResult || !resultSectionRef.current) return;
    
    const resultSection = resultSectionRef.current;
    const scrollAmount = 100;
    const pageScrollAmount = resultSection.clientHeight * 0.8;
    
    // Handler for scroll events from main process (global shortcuts)
    const handleGlobalScroll = (direction) => {
      console.log(`Global scroll: ${direction}`);
      
      switch(direction) {
        case 'down':
          resultSection.scrollTop += scrollAmount;
          break;
        case 'up':
          resultSection.scrollTop -= scrollAmount;
          break;
        case 'pagedown':
          resultSection.scrollTop += pageScrollAmount;
          break;
        case 'pageup':
          resultSection.scrollTop -= pageScrollAmount;
          break;
        case 'top':
          resultSection.scrollTop = 0;
          break;
        case 'bottom':
          resultSection.scrollTop = resultSection.scrollHeight;
          break;
      }
    };
    
    // Local keyboard handler (when app is in focus)
    const handleKeyDown = (e) => {
      // Regular navigation keys (only if no modifiers)
      if (!e.metaKey && !e.ctrlKey && !e.altKey) {
        if (e.key === 'ArrowDown' || e.key === 'j') {
          resultSection.scrollTop += scrollAmount;
        } else if (e.key === 'ArrowUp' || e.key === 'k') {
          resultSection.scrollTop -= scrollAmount;
        } else if (e.key === ' ' || e.key === 'f') {
          resultSection.scrollTop += pageScrollAmount;
        } else if (e.key === 'b') {
          resultSection.scrollTop -= pageScrollAmount;
        } else if (e.key === 'Home') {
          resultSection.scrollTop = 0;
        } else if (e.key === 'End') {
          resultSection.scrollTop = resultSection.scrollHeight;
        }
      }
    };
    
    // Register event handlers
    window.api.onScrollAnalysis(handleGlobalScroll);
    window.addEventListener('keydown', handleKeyDown);
    
    // Clean up event listeners
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      // Note: The main process listener cleanup happens via removeAllListeners in App.jsx unmount
    };
  }, [analysisResult]);

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
      {/* Ultra-compact screenshot strip at top */}
      {screenshot && (
        <div className="screenshot-micro-strip">
          <img 
            src={`file://${screenshot}`} 
            alt="Code screenshot" 
            className="screenshot-micro" 
            onClick={() => window.open(`file://${screenshot}`, '_blank')}
            title="Click to view full-size"
          />
        </div>
      )}
      
      {/* Main result section takes full width */}
      <div className="result-section-fullwidth" ref={resultSectionRef}>
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
          <div
              tabIndex={0}
              className="result-content markdown-content analysis-result response-section"
              onKeyDown={(e) => {
                if (['ArrowDown', 'ArrowUp'].includes(e.key)) {
                  const el = responseSectionRef.current;
                  const isModifierPressed = e.metaKey || e.ctrlKey;
                  const scrollAmount = isModifierPressed ? 200 : 50;

                  if (e.key === 'ArrowUp') {
                    el.scrollTop -= scrollAmount;
                  } else if (e.key === 'ArrowDown') {
                    el.scrollTop += scrollAmount;
                  }

                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
              ref={responseSectionRef}>
            <div
                className="response-content"
                onClick={(e) => {
                  e.stopPropagation();
                  responseSectionRef.current.focus();
                }}
            >
              {formattedResult.length > 0 ? formattedResult.map((responsePart, index) => (
                  responsePart.type === 'code' ? (
                      <div key={`code-${index}`} className="code-block">
                        <div className="code-header">
                          <div className="code-header-left">
                            <span className="code-language">{responsePart.language}</span>
                            {responsePart.title && <span className="code-filename">{responsePart.title}</span>}
                          </div>
                        </div>
                        <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={responsePart.language}
                            customStyle={{
                              margin: '0',
                              borderRadius: '0 0 4px 4px',
                              fontSize: '13px',
                              maxWidth: '100%',
                              background: 'rgba(30, 30, 30, 0.7)',
                            }}
                            wrapLongLines={false}
                            showLineNumbers={true}
                        >
                          {responsePart.content}
                        </SyntaxHighlighter>
                      </div>
                  ) : (
                      <div key={`text-${index}`} className="text-content">
                        {responsePart.content.split('\n').map((line, i) => (
                            <React.Fragment key={i}>
                              {line}
                              {i < responsePart.content.split('\n').length - 1 && <br />}
                            </React.Fragment>
                        ))}
                      </div>
                  )
              )) : null}
            </div>
            {showScrollIndicator && (
                <div className="scroll-indicator">
                  <span>Scroll for more</span>
                </div>
            )}
          </div>
        ) : (
          <div className="result-placeholder">
            Take a screenshot and click "Analyze" to get results from GPT-4o
          </div>
        )}
      </div>
      
      {/* Small buttons at bottom */}
      <div className="footer-buttons">
        <button 
          className="small-btn" 
          onClick={onScreenshot}
        >
          Capture
        </button>
        
        <button 
          className="small-btn analyze-btn"
          id="analyze-btn"
          onClick={analyzeCode}
          disabled={!screenshot || isAnalyzing}
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>
    </div>
  );
});

export default AnalysisArea;
