# CodeSolve

CodeSolve is a streamlined overlay application that helps developers solve coding problems by taking screenshots and using OpenAI's GPT-4o to analyze code issues. The app remains in the background while providing intelligent solutions without disrupting your workflow.

## Features

- **Optimized Interface**: Prioritizes solution content with compact screenshot display
- **Smart Screenshot Management**: Quickly capture code snippets with one-click enlargement
- **AI-Powered Analysis**: Uses OpenAI's GPT-4o to analyze code and provide detailed solutions
- **Global Keyboard Controls**: Navigate content even while focused on other applications
- **Modern Settings UI**: Tabbed interface for managing API keys, keyboard shortcuts, and app info
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

#### Global Controls (work even when CodeSolve is not in focus)
- **⌘+H**: Capture a screenshot of code you want to analyze
- **⌘+Enter**: Analyze the captured code using GPT-4o
- **⌘+Shift+Space**: Toggle window visibility (hide/show)
- **⌘+Shift+C**: Toggle click-through mode (allows clicking through the window to interact with apps behind it)

#### Navigation Controls
- **⌘+Shift+↑**: Scroll up in analysis results (works when in other apps)
- **⌘+Shift+↓**: Scroll down in analysis results (works when in other apps)
- **⌘+Shift+Page Up**: Jump up a page in analysis results
- **⌘+Shift+Page Down**: Jump down a page in analysis results

#### In-app Navigation (when CodeSolve has focus)
- **↑/↓** or **j/k**: Scroll up/down
- **Space** or **f**: Page down
- **b**: Page up
- **Home/End**: Jump to top/bottom of solution

### Workflow
1. Position the CodeSolve window where you want it or enable click-through mode
2. Press **⌘+H** to take a screenshot of your code
3. Press **⌘+Enter** to analyze the code
4. Browse through the solution using keyboard shortcuts while continuing to work in your editor
5. Click on the compact screenshot preview to view the original image if needed
6. Access settings via the gear icon to manage your API key, view keyboard shortcuts, or check app info

## Technical Details

CodeSolve is built with:
- **Electron**: For creating the desktop application and global keyboard shortcuts
- **React**: For building the user interface components
- **OpenAI API**: For code analysis with GPT-4o
- **Prism.js**: For syntax highlighting of code blocks
- **Marked**: For rendering markdown content in the analysis results
- **CSS3**: For styling with modern transitions and animations
- **AppKit**: For system-level functionality on macOS

## UI Features

### Optimized Layout
- Compact screenshot display (60px) that expands on click
- Full-width analysis results for better readability
- Tabbed settings interface for easy configuration
- Keyboard shortcut overlays for quick reference

### Settings Interface
- **API Key Tab**: Securely manage your OpenAI API key
- **Shortcuts Tab**: Visual representation of all keyboard shortcuts
- **About Tab**: App information and version details

## Privacy and Security

- Your OpenAI API key is stored locally using electron-store with encryption
- CodeSolve does not collect or transmit any data other than sending screenshots to OpenAI for analysis
- Screenshots are stored temporarily and deleted when the application closes

## License

This project is licensed under the MIT License - see the LICENSE file for details.
