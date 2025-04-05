import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { marked } from 'marked';
import Prism from 'prismjs';

// Define syntax highlighting colors directly to ensure they're applied
const prismColors = {
  // Token colors for syntax highlighting
  'token.comment': { color: '#6a9955' },
  'token.string': { color: '#ce9178' },
  'token.number': { color: '#b5cea8' },
  'token.keyword': { color: '#569cd6' },
  'token.function': { color: '#dcdcaa' },
  'token.class-name': { color: '#4ec9b0' },
  'token.operator': { color: '#d4d4d4' },
  'token.punctuation': { color: '#d4d4d4' },
  'token.property': { color: '#9cdcfe' },
  'token.tag': { color: '#569cd6' },
  'token.selector': { color: '#d7ba7d' },
  'token.attr-name': { color: '#9cdcfe' },
  'token.attr-value': { color: '#ce9178' },
  'token.boolean': { color: '#569cd6' },
  'token.regex': { color: '#d16969' },
  'token.important': { color: '#569cd6' }
};

const AnalysisArea = forwardRef(({ 
  screenshot, 
  isAnalyzing: externalIsAnalyzing,
  onScreenshot, 
  onStatusChange 
}, ref) => {
  const [isAnalyzing, setIsAnalyzing] = useState(externalIsAnalyzing);
  const [analysisResult, setAnalysisResult] = useState('');
  const [error, setError] = useState(null);
  const [renderedContent, setRenderedContent] = useState('');
  
  // Inject syntax highlighting styles
  useEffect(() => {
    // Create a style element
    const styleEl = document.createElement('style');
    
    // Define CSS for code syntax highlighting to match the example
    const css = `
      /* Main containers */
      pre[class*="language-"] {
        background: rgb(16, 16, 16);
        border-radius: 4px;
        padding: 0.5em;
        margin: 0.5em 0;
        overflow: auto;
        border: 1px solid rgba(255, 255, 255, 0.1);
        counter-reset: line;
        font-size: 14px;
      }
      
      code[class*="language-"] {
        color: #f8f8f2;
        font-family: 'JetBrains Mono', Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
        text-align: left;
        white-space: pre;
        word-spacing: normal;
        word-break: normal;
        word-wrap: normal;
        line-height: 1.5;
        tab-size: 4;
        hyphens: none;
      }
      
      /* Line numbers */
      code[class*="language-"] .line::before {
        counter-increment: line;
        content: counter(line);
        display: inline-block;
        width: 20px;
        padding-right: 0.5em;
        margin-right: 0.5em;
        color: #555;
        text-align: right;
        border-right: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      /* Section headers */
      .analysis-result h2 {
        font-size: 1.3em;
        margin-top: 1.5em;
        color: white;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding-bottom: 0.3em;
      }
      
      /* List styling */
      .analysis-result ul {
        list-style-type: disc;
        margin-left: 1.5em;
        margin-bottom: 1em;
      }
      
      .analysis-result li {
        margin-bottom: 0.5em;
      }
      
      /* Python-specific syntax colors */
      .token.comment,
      .token.prolog,
      .token.doctype,
      .token.cdata {
        color: #88846f; /* Light grey-brown for comments */
      }
      
      .token.punctuation {
        color: #d4d4d4;
      }
      
      .token.property,
      .token.tag,
      .token.constant,
      .token.symbol,
      .token.deleted {
        color: #9cdcfe;
      }
      
      .token.boolean,
      .token.number {
        color: #b5cea8;
      }
      
      .token.selector,
      .token.attr-name,
      .token.string,
      .token.char,
      .token.builtin,
      .token.inserted {
        color: #ce9178;
      }
      
      .token.operator,
      .token.entity,
      .token.url {
        color: #d4d4d4;
      }
      
      /* Python keywords */
      .token.keyword {
        color: #569cd6; /* Blue for def, if, for, return */
      }
      
      /* Python functions and classes */
      .token.function {
        color: #c586c0; /* Purple for function names */
      }
      
      .token.class-name {
        color: #4ec9b0;
      }
      
      /* Variables */
      .token.variable {
        color: #9cdcfe; /* Light blue for variables */
      }
      
      /* Special styling for inline code */
      :not(pre) > code {
        background: rgba(0, 0, 0, 0.3);
        padding: 0.1em 0.3em;
        border-radius: 0.3em;
        font-family: 'JetBrains Mono', Consolas, Monaco, monospace;
      }
    `;
    
    // Add the CSS to the style element
    styleEl.textContent = css;
    
    // Add the style element to the head
    document.head.appendChild(styleEl);
    
    // Clean up on unmount
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);
  
  // Configure marked to use Prism for syntax highlighting with line numbers
  marked.setOptions({
    highlight: function(code, lang) {
      // Process the code to add line numbers
      let highlightedCode;
      
      // If language is specified and Prism knows about it
      if (lang && Prism.languages[lang]) {
        highlightedCode = Prism.highlight(code, Prism.languages[lang], lang);
      } 
      // Some common language mappings that might come from OpenAI
      else if (lang === 'js' || lang === 'jsx') {
        highlightedCode = Prism.highlight(code, Prism.languages.javascript, 'javascript');
      }
      else if (lang === 'ts' || lang === 'tsx') {
        highlightedCode = Prism.highlight(code, Prism.languages.javascript, 'javascript');
      }
      else if (lang === 'py') {
        highlightedCode = Prism.highlight(code, Prism.languages.javascript, 'javascript');
      }
      // Fallback - just return the code formatted properly
      else {
        highlightedCode = code;
      }
      
      // Add line numbers by wrapping each line in a span
      const lines = highlightedCode.split('\n');
      return lines
        .map(line => `<span class="line">${line}</span>`)
        .join('\n');
    },
    breaks: true,
    gfm: true
  });
  
  // Function to render markdown with code highlighting
  const renderMarkdown = (text) => {
    if (!text) return '';
    return marked(text);
  };
  
  // Expose the analyzeCode method to parent components via ref
  useImperativeHandle(ref, () => ({
    analyzeCode
  }));
  
  // Update rendered content when analysis result changes
  useEffect(() => {
    if (analysisResult) {
      setRenderedContent(renderMarkdown(analysisResult));
    }
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
      <div className="result-section-fullwidth">
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
          <div className="result-content markdown-content analysis-result">
            <div dangerouslySetInnerHTML={{ __html: renderedContent }} />
          </div>
        ) : (
          <div className="result-placeholder">
            Take a screenshot and click "Analyze Code" to get results from GPT-4o
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
