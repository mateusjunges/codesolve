# CodeSolve

CodeSolve is a transparent overlay application that helps developers solve coding problems by taking screenshots and using OpenAI's GPT-4o to analyze code issues. The app remains invisible to other applications while providing real-time solutions without disrupting your workflow.

## Features

- **Transparent Overlay**: Stays on top of all your applications with a translucent window
- **Screenshot Capture**: Quickly capture code snippets directly from your IDE or browser
- **AI-Powered Analysis**: Uses OpenAI's GPT-4o to analyze code and provide solutions
- **Keyboard Shortcuts**: Control the application without leaving your workflow
- **Secure API Key Storage**: Your OpenAI API key is securely stored locally
- **Syntax Highlighting**: Code solutions are displayed with proper syntax highlighting

## Installation

1. Clone this repository:
```bash
git clone https://github.com/yourusername/codesolve.git
cd codesolve
```

2. Install dependencies:
```bash
npm install
```

3. Run the application:
```bash
npm start
```

## Usage

### First Launch
1. When you first launch CodeSolve, you'll be prompted to enter your OpenAI API key.
2. Your API key will be securely stored locally on your device.

### Keyboard Shortcuts
- **⌘+H**: Capture a screenshot of code you want to analyze
- **⌘+Enter**: Analyze the captured code using GPT-4o
- **⌘+Shift+Space**: Toggle window visibility (hide/show)
- **⌘+Shift+C**: Toggle click-through mode (allows clicking through the window to interact with apps behind it)

### Workflow
1. Position the CodeSolve window so it doesn't cover the code you want to analyze
2. Press **⌘+H** to take a screenshot of your code
3. Press **⌘+Enter** to analyze the code
4. View the analysis and solutions in the transparent window

## Technical Details

CodeSolve is built with:
- **Electron**: For creating the desktop application
- **OpenAI API**: For code analysis with GPT-4o
- **Prism.js**: For syntax highlighting
- **AppKit**: For system-level functionality on macOS

## Privacy and Security

- Your OpenAI API key is stored locally using electron-store with encryption
- CodeSolve does not collect or transmit any data other than sending screenshots to OpenAI for analysis
- Screenshots are stored temporarily and deleted when the application closes

## License

This project is licensed under the MIT License - see the LICENSE file for details.
