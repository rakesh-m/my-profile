import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
} from 'firebase/auth';
import { auth, googleProvider, SESSION_MAX_AGE_MS } from './firebase';
import { logVisit } from './logVisit';

const AuthContext = createContext(null);

const SESSION_KEY = 'profileSessionStart';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expired, setExpired] = useState(false);

  // Sign the user out and clear the recorded session start.
  const signOut = useCallback(async () => {
    localStorage.removeItem(SESSION_KEY);
    await fbSignOut(auth);
    setExpired(false);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    // Always ask the user to select an account so re-auth after expiry is clean.
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    const cred = await signInWithPopup(auth, googleProvider);
    localStorage.setItem(SESSION_KEY, String(Date.now()));
    setExpired(false);
    // Record this sign-in in the visit log (owner-readable only).
    logVisit(cred.user);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        // Establish a session start timestamp if one is missing (e.g. the auth
        // state was restored from a persisted Firebase session).
        let start = Number(localStorage.getItem(SESSION_KEY));
        if (!start) {
          start = Date.now();
          localStorage.setItem(SESSION_KEY, String(start));
        }
        const age = Date.now() - start;
        if (age >= SESSION_MAX_AGE_MS) {
          // Session too old: force re-authentication.
          setExpired(true);
          setUser(null);
          fbSignOut(auth);
          localStorage.removeItem(SESSION_KEY);
        } else {
          setUser(u);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // Proactively expire the session while the tab stays open.
  useEffect(() => {
    if (!user) return undefined;
    const start = Number(localStorage.getItem(SESSION_KEY)) || Date.now();
    const remaining = SESSION_MAX_AGE_MS - (Date.now() - start);
    const timer = setTimeout(() => {
      setExpired(true);
      signOut();
    }, Math.max(remaining, 0));
    return () => clearTimeout(timer);
  }, [user, signOut]);

  const value = { user, loading, expired, signInWithGoogle, signOut };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
