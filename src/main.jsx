import React from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './auth/AuthProvider.jsx';
import { AuthGate } from './auth/AuthGate.jsx';
import App from './App.jsx';
import './styles.css';

// GitHub Pages is the public, local-playtest build. Keep account features
// available on the authenticated host, but never block the game behind login
// when the optional Neon Auth service is not configured on static hosting.
const pagesHost = import.meta.env.VITE_PAGES_HOST === 'true';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      {pagesHost ? <App /> : <AuthGate />}
    </AuthProvider>
  </React.StrictMode>
);
