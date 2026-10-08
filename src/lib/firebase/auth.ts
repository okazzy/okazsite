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
import { doc, setDoc, runTransaction, Timestamp } from 'firebase/firestore';
import { auth, db } from './config';
import { planUserDocWrite } from './userDoc';
import type { UserModel } from '../models';

/* ------------------------------------------------------------------ */
/*  Helper: make sure the user document exists                        */
/* ------------------------------------------------------------------ */

/**
 * Users are shared with the mobile app. If the document already exists it holds
 * the user's favorites, premium flag and streaks, so it is never reset: we only
 * create it when missing, or fill empty profile fields. See userDoc.ts.
 * Runs in a transaction so the exists-check and the write cannot race.
 */
async function ensureUserDoc(
  uid: string,
  options: {
    email?: string;
    displayName?: string;
    photoUrl?: string;
    isGuest: boolean;
  }
): Promise<void> {
  const ref = doc(db, 'users', uid);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const plan = planUserDocWrite(
      snap.exists() ? (snap.data() as Record<string, unknown>) : undefined,
      uid,
      options,
      Timestamp.now()
    );
    if (plan.kind === 'create') tx.set(ref, plan.data);
    else if (plan.kind === 'update') tx.update(ref, plan.data);
  });
}

/* ------------------------------------------------------------------ */
/*  Anonymous sign-in                                                 */
/* ------------------------------------------------------------------ */

export async function signInAnonymously(): Promise<User> {
  const credential = await firebaseSignInAnonymously(auth);
  const user = credential.user;

  await ensureUserDoc(user.uid, { isGuest: true });
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
  await ensureUserDoc(user.uid, {
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

  await ensureUserDoc(user.uid, {
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

  await ensureUserDoc(user.uid, {
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
