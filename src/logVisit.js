import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

// Records a visit for the signed-in user. Each sign-in creates one document in
// the `visits` collection so the owner can see a full history of who accessed
// the profile and when. Failures are swallowed so logging never blocks access.
export async function logVisit(user) {
  if (!user) return;
  try {
    await addDoc(collection(db, 'visits'), {
      uid: user.uid,
      email: user.email || null,
      name: user.displayName || null,
      photoURL: user.photoURL || null,
      userAgent:
        typeof navigator !== 'undefined' ? navigator.userAgent : null,
      timestamp: serverTimestamp(),
    });
  } catch (e) {
    // Non-fatal: logging must not interfere with viewing the profile.
  }
}
