import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('root');
  const root = createRoot(container);
  root.render(<App />);
});
