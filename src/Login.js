import { useState } from 'react';
import './App.css';
import { useAuth } from './AuthContext';

export default function Login() {
  const { signInWithGoogle, expired } = useAuth();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSignIn = async () => {
    setError('');
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      if (e && e.code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled.');
      } else {
        setError('Could not sign in. Please try again.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login">
      <div className="login-card">
        <h1>Rakesh Mhasawade</h1>
        <p className="login-sub">This profile is private.</p>
        {expired && (
          <p className="login-expired">
            Your 24-hour access has expired. Please sign in again to continue.
          </p>
        )}
        <button className="google-btn" onClick={handleSignIn} disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in with Google'}
        </button>
        {error && <p className="login-error">{error}</p>}
        <p className="login-note">Access is granted for 24 hours per sign-in.</p>
      </div>
    </div>
  );
}
