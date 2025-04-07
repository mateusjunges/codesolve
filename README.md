# 🔍 CodeSolve

<div align="center">
  
  ![CodeSolve Logo](https://placehold.co/600x200/3498db/ffffff?text=CodeSolve&font=montserrat)
  
  **An AI-powered coding assistant that lives in your workflow**
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
  [![Made with Electron](https://img.shields.io/badge/Made%20with-Electron-1f425f.svg)](https://www.electronjs.org/)
  [![Powered by OpenAI](https://img.shields.io/badge/Powered%20by-OpenAI-412991.svg)](https://openai.com/)
  
</div>

## 📋 Overview

CodeSolve is a streamlined overlay application designed for developers to solve coding problems without disrupting their workflow. With a simple screenshot capture, CodeSolve leverages OpenAI's GPT-4o to analyze code issues and provide intelligent solutions while remaining unobtrusive in the background.

## ✨ Key Features

- **Seamless Workflow Integration**: Stays in the background until needed, with global keyboard shortcuts
- **Intelligent Code Analysis**: Powered by OpenAI's GPT-4o for accurate problem solving
- **Smart UI Design**:
  - Optimized interface prioritizing solutions over screenshot display
  - One-click expandable screenshot thumbnails
  - Syntax-highlighted code solutions
- **Powerful Navigation**: Global keyboard controls work even when focused in other applications
- **Secure & Private**: Local API key storage with encryption

## 🚀 Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/codesolve.git

# Navigate to project directory
cd codesolve

# Install dependencies
npm install

# Launch the application
npm start
```

### First-time Setup

On your first launch, you'll be prompted to enter your OpenAI API key, which will be securely stored locally on your device.

## 🎮 Usage Guide

### Keyboard Command Reference

| Action | Global Shortcut | In-app Shortcut |
|--------|----------------|------------------|
| Capture screenshot | ⌘+S | - |
| Analyze code | ⌘+Enter | - |
| Toggle visibility | ⌘+B | - |
| Move window | ⌘+Option+Arrow Keys | - |
| Toggle click-through | ⌘+Shift+C | - |
| Scroll up/down | ⌘+Shift+↑/↓ | ↑/↓ |

### Workflow Example

1. Position the CodeSolve window or enable click-through mode for unobstructed view
2. Use **⌘+H** to capture a screenshot of problematic code
3. Press **⌘+Enter** to get AI-powered analysis
4. Browse through solutions with keyboard shortcuts while continuing to work in your IDE
5. Access the original screenshot by clicking the compact preview
6. Configure settings via the gear icon

## 🛠️ Technical Architecture

### Technology Stack
- **Electron**: Cross-platform desktop application framework
- **React**: UI component library
- **OpenAI API**: AI-powered code analysis with GPT-4o
- **Prism.js**: Syntax highlighting for code solutions
- **Marked**: Markdown rendering for analysis results
- **CSS3**: Modern animations and transitions
- **AppKit**: macOS system integration

### UI Components
- **Main Interface**: Optimized for solution readability with collapsible elements
- **Settings Panel**:
  - API Key management with secure storage
  - Visual keyboard shortcut reference
  - Application information and version details

## 🔒 Privacy & Security

- OpenAI API keys are encrypted and stored locally using electron-store
- No data collection beyond sending screenshots to OpenAI for analysis
- Temporary screenshot storage with automatic deletion on application close

## 📜 License

CodeSolve is licensed under the [MIT License](LICENSE) - feel free to use, modify, and distribute as needed.

---

<div align="center">

  
  [Report Bug](https://github.com/yourusername/codesolve/issues) · [Request Feature](https://github.com/yourusername/codesolve/issues)
  
</div>
