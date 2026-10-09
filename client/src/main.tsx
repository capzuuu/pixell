import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { adShield } from './utils/adShield';

// Initialize global AdShield defense against popup ads and unrequested tab spawns
adShield.activate();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
