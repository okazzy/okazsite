'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { initAppCheck } from '@/lib/firebase/appcheck';
import { getUserData } from '@/lib/firebase/firestore';
import { signInAnonymously as firebaseSignInAnonymously } from '@/lib/firebase/auth';
import type { UserModel } from '@/lib/models';

interface AuthContextType {
  firebaseUser: User | null;
  userData: UserModel | null;
  loading: boolean;
  isGuest: boolean;
  isAuthenticated: boolean;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  userData: null,
  loading: true,
  isGuest: true,
  isAuthenticated: false,
  refreshUserData: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserModel | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize App Check on mount
  useEffect(() => {
    initAppCheck();
  }, []);

  // Listen to Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (user) {
        try {
          const data = await getUserData(user.uid);
          setUserData(data);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUserData(null);
        }
      } else {
        // No user — sign in anonymously
        try {
          await firebaseSignInAnonymously();
        } catch (error) {
          console.error('Anonymous sign-in failed:', error);
        }
        setUserData(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshUserData = async () => {
    if (firebaseUser) {
      try {
        const data = await getUserData(firebaseUser.uid);
        setUserData(data);
      } catch (error) {
        console.error('Error refreshing user data:', error);
      }
    }
  };

  const isGuest = !firebaseUser || firebaseUser.isAnonymous;
  const isAuthenticated = !!firebaseUser && !firebaseUser.isAnonymous;

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        userData,
        loading,
        isGuest,
        isAuthenticated,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
