import React from 'react';
import { AuthPanel } from './AuthPanel';
import { useAuth } from './AuthProvider';
import App from '../App.jsx';

export function AuthGate() {
  const { user, loading, signOut } = useAuth();
  if (loading) return <main className="auth-shell"><section className="auth-card">Connecting to StoryFoundry…</section></main>;
  if (!user) return <AuthPanel />;
  return <div className="signed-in-app">
    <div className="account-bar">
      <span>Signed in as {user.email}</span>
      <button type="button" onClick={() => signOut().catch(console.error)}>Sign out</button>
    </div>
    <App />
  </div>;
}
