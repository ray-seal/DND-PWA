import React, { useState } from 'react';
import { useAuth } from './AuthProvider';

export function AuthPanel() {
  const { signIn, signUp, error: providerError, setError, loading } = useAuth();
  const [mode, setMode] = useState('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setBusy(true); setLocalError(''); setError('');
    try {
      if (mode === 'signup') await signUp({ name: name || email.split('@')[0], email, password });
      else await signIn({ email, password });
    } catch (err) {
      setLocalError(err?.message || 'Could not authenticate.');
    } finally { setBusy(false); }
  }

  return <main className="auth-shell">
    <section className="auth-card">
      <div className="eyebrow">STORYFOUNDRY ACCOUNT</div>
      <h1>{mode === 'signup' ? 'Keep your adventures.' : 'Welcome back.'}</h1>
      <p>Save your characters, campaigns and progress across devices.</p>
      <form onSubmit={submit}>
        {mode === 'signup' && <label className="field"><span>Display name</span><input value={name} onChange={e=>setName(e.target.value)} autoComplete="name" /></label>}
        <label className="field"><span>Email</span><input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" required /></label>
        <label className="field"><span>Password</span><input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete={mode === 'signup' ? 'new-password':'current-password'} minLength={8} required /></label>
        {(localError || providerError) && <div className="error" role="alert">{localError || providerError}</div>}
        <button className="submit" disabled={busy || loading}>{busy ? 'PLEASE WAIT…' : mode === 'signup' ? 'CREATE ACCOUNT' : 'SIGN IN'}</button>
      </form>
      <button className="auth-switch" type="button" onClick={()=>{setMode(mode==='signup'?'signin':'signup');setLocalError('');setError('');}}>
        {mode === 'signup' ? 'Already have an account? Sign in' : 'New to StoryFoundry? Create an account'}
      </button>
    </section>
  </main>;
}
