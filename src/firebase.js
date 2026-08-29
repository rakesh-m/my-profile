import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Firebase web config. The apiKey here is a public client identifier, not a
// secret — access is protected by Firebase Auth + Firestore security rules.
const firebaseConfig = {
  apiKey: 'AIzaSyB1tHB0wafFSZVYElWOpcZHRZX27FBW62w',
  authDomain: 'rakesh-profile-85519.firebaseapp.com',
  projectId: 'rakesh-profile-85519',
  storageBucket: 'rakesh-profile-85519.firebasestorage.app',
  messagingSenderId: '249455200987',
  appId: '1:249455200987:web:ce9a3a1f197f1f94441afe',
  measurementId: 'G-9GR9J63M8M',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Google Analytics. This automatically logs a page_view for every
// visitor — including anonymous users who only ever see the login screen.
// isSupported() guards against environments where Analytics can't run (e.g.
// server-side rendering or unsupported browsers).
isSupported()
  .then((supported) => {
    if (supported) getAnalytics(app);
  })
  .catch(() => {
    // Analytics is optional; ignore initialization failures.
  });

// How long a session is valid before the user must sign in with Google again.
export const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

// The profile owner. Only this account can read the visit log.
export const OWNER_EMAIL = 'rakesh.cm@gmail.com';
