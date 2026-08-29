import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase web config. The apiKey here is a public client identifier, not a
// secret — access is protected by Firebase Auth + Firestore security rules.
const firebaseConfig = {
  apiKey: 'AIzaSyB1tHB0wafFSZVYElWOpcZHRZX27FBW62w',
  authDomain: 'rakesh-profile-85519.firebaseapp.com',
  projectId: 'rakesh-profile-85519',
  storageBucket: 'rakesh-profile-85519.firebasestorage.app',
  messagingSenderId: '249455200987',
  appId: '1:249455200987:web:ce9a3a1f197f1f94441afe',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// How long a session is valid before the user must sign in with Google again.
export const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours
