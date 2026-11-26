import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { neonAuth } from './neonAuth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(neonAuth));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!neonAuth) return;
    let active = true;
    neonAuth.getSession()
      .then((result) => { if (active) setUser(result.data?.user ?? null); })
      .catch((err) => { if (active) setError(err?.message || 'Could not restore session.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const signIn = useCallback(async ({ email, password }) => {
    if (!neonAuth) throw new Error('Account service is not configured.');
    setError('');
    const result = await neonAuth.signIn.email({ email, password });
    if (result.error) throw new Error(result.error.message || 'Sign-in failed.');
    const current = await neonAuth.getSession();
    setUser(current.data?.user ?? null);
    return current.data?.user ?? null;
  }, []);

  const signUp = useCallback(async ({ name, email, password }) => {
    if (!neonAuth) throw new Error('Account service is not configured.');
    setError('');
    const result = await neonAuth.signUp.email({ name, email, password });
    if (result.error) throw new Error(result.error.message || 'Sign-up failed.');
    const current = await neonAuth.getSession();
    setUser(current.data?.user ?? null);
    return current.data?.user ?? null;
  }, []);

  const getAccessToken = useCallback(async () => {
    if (!neonAuth) throw new Error('Account service is not configured.');
    // @neondatabase/auth exposes getJWTToken() on the public client.
    // getSession().session.token is an opaque cookie/session identifier, not a JWT.
    if (typeof neonAuth.getJWTToken !== 'function') {
      throw new Error('This StoryFoundry build cannot retrieve an account access token. Please refresh after the update.');
    }
    const token = await neonAuth.getJWTToken();
    if (!token) throw new Error('Your account session could not provide an access token. Please sign out and back in.');
    return token;
  }, []);

  const signOut = useCallback(async () => {
    if (!neonAuth) return;
    const result = await neonAuth.signOut();
    if (result.error) throw new Error(result.error.message || 'Sign-out failed.');
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, error, setError, signIn, signUp, getAccessToken, signOut }),
    [user, loading, error, signIn, signUp, getAccessToken, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider.');
  return value;
}
