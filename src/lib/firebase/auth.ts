import {
  signInAnonymously as firebaseSignInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  linkWithCredential,
  EmailAuthProvider,
  updateProfile,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  deleteUser,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  type User,
  type Unsubscribe,
} from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from './config';
import type { UserModel } from '../models';

/* ------------------------------------------------------------------ */
/*  Helper: create user document in Firestore                         */
/* ------------------------------------------------------------------ */

async function createUserDoc(
  uid: string,
  options: {
    email?: string;
    displayName?: string;
    photoUrl?: string;
    isGuest: boolean;
  }
): Promise<void> {
  // Firestore does NOT accept undefined values — only include defined fields
  const userData: Record<string, unknown> = {
    uid,
    isPremium: false,
    isGuest: options.isGuest,
    favorites: [],
    favoriteVideos: [],
    dailyPlays: 0,
    lastPlayedDate: Timestamp.now(),
  };

  if (options.email) userData.email = options.email;
  if (options.displayName) userData.displayName = options.displayName;
  if (options.photoUrl) userData.photoUrl = options.photoUrl;

  // merge: true prevents overwriting existing user data on repeat sign-ins
  await setDoc(doc(db, 'users', uid), userData, { merge: true });
}

/* ------------------------------------------------------------------ */
/*  Anonymous sign-in                                                 */
/* ------------------------------------------------------------------ */

export async function signInAnonymously(): Promise<User> {
  const credential = await firebaseSignInAnonymously(auth);
  const user = credential.user;

  await createUserDoc(user.uid, { isGuest: true });
  return user;
}

/* ------------------------------------------------------------------ */
/*  Email / password sign-in                                          */
/* ------------------------------------------------------------------ */

export async function signInWithEmail(
  email: string,
  password: string
): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

/* ------------------------------------------------------------------ */
/*  Email / password registration                                     */
/* ------------------------------------------------------------------ */

export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  const user = credential.user;

  await updateProfile(user, { displayName });
  await createUserDoc(user.uid, {
    email,
    displayName,
    isGuest: false,
  });

  return user;
}

/* ------------------------------------------------------------------ */
/*  Google sign-in                                                    */
/* ------------------------------------------------------------------ */

export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(auth, provider);
  const user = credential.user;

  await createUserDoc(user.uid, {
    email: user.email ?? undefined,
    displayName: user.displayName ?? undefined,
    photoUrl: user.photoURL ?? undefined,
    isGuest: false,
  });

  return user;
}

/* ------------------------------------------------------------------ */
/*  Apple sign-in                                                     */
/* ------------------------------------------------------------------ */

export async function signInWithApple(): Promise<User> {
  const provider = new OAuthProvider('apple.com');
  provider.addScope('email');
  provider.addScope('name');

  const credential = await signInWithPopup(auth, provider);
  const user = credential.user;

  await createUserDoc(user.uid, {
    email: user.email ?? undefined,
    displayName: user.displayName ?? undefined,
    photoUrl: user.photoURL ?? undefined,
    isGuest: false,
  });

  return user;
}

/* ------------------------------------------------------------------ */
/*  Link anonymous account to email                                   */
/* ------------------------------------------------------------------ */

export async function linkAnonymousToEmail(
  email: string,
  password: string,
  displayName: string
): Promise<User> {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('No current user');

  const emailCredential = EmailAuthProvider.credential(email, password);
  const result = await linkWithCredential(currentUser, emailCredential);
  const user = result.user;

  await updateProfile(user, { displayName });
  await setDoc(
    doc(db, 'users', user.uid),
    {
      email,
      displayName,
      isGuest: false,
    },
    { merge: true }
  );

  return user;
}

/* ------------------------------------------------------------------ */
/*  Update display name                                               */
/* ------------------------------------------------------------------ */

export async function updateDisplayName(name: string): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('No current user');

  await updateProfile(currentUser, { displayName: name });
  await setDoc(
    doc(db, 'users', currentUser.uid),
    { displayName: name },
    { merge: true }
  );
}

/* ------------------------------------------------------------------ */
/*  Password reset                                                    */
/* ------------------------------------------------------------------ */

export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

/* ------------------------------------------------------------------ */
/*  Sign out                                                          */
/* ------------------------------------------------------------------ */

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

/* ------------------------------------------------------------------ */
/*  Delete account                                                    */
/* ------------------------------------------------------------------ */

export async function deleteAccount(): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('No current user');

  await deleteUser(currentUser);
}

/* ------------------------------------------------------------------ */
/*  Auth state listener                                               */
/* ------------------------------------------------------------------ */

export function onAuthStateChanged(
  callback: (user: User | null) => void
): Unsubscribe {
  return firebaseOnAuthStateChanged(auth, callback);
}

/* ------------------------------------------------------------------ */
/*  Get current user                                                  */
/* ------------------------------------------------------------------ */

export function getCurrentUser(): User | null {
  return auth.currentUser;
}
