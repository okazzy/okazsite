'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { initAppCheck } from '@/lib/firebase/appcheck';
import { getUserData, getGuestLimit, incrementDailyPlays } from '@/lib/firebase/firestore';
import { signInAnonymously as firebaseSignInAnonymously } from '@/lib/firebase/auth';
import type { UserModel } from '@/lib/models';
import PaywallModal from '@/components/modals/PaywallModal';

interface AuthContextType {
  firebaseUser: User | null;
  userData: UserModel | null;
  loading: boolean;
  isGuest: boolean;
  isAuthenticated: boolean;
  refreshUserData: () => Promise<void>;
  showPaywall: boolean;
  setShowPaywall: (show: boolean) => void;
  checkGuestLimit: () => boolean;
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  userData: null,
  loading: true,
  isGuest: true,
  isAuthenticated: false,
  refreshUserData: async () => {},
  showPaywall: false,
  setShowPaywall: () => {},
  checkGuestLimit: () => true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);
  const [guestLimit, setGuestLimit] = useState(3);

  // Initialize App Check and fetch guest limit on mount
  useEffect(() => {
    initAppCheck();
    getGuestLimit().then(setGuestLimit).catch(console.error);
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

  const checkGuestLimit = useCallback((): boolean => {
    if (isAuthenticated) return true;

    // Default to 0 plays if userData is null (e.g., fresh guest)
    const plays = userData ? userData.dailyPlays : 0;
    
    if (plays >= guestLimit) {
      setShowPaywall(true);
      return false;
    }
    
    // Allowed: increment in the background so it doesn't block playback immediately
    if (firebaseUser) {
      incrementDailyPlays(firebaseUser.uid)
        .then(() => refreshUserData())
        .catch(console.error);
    }
    return true;
  }, [isAuthenticated, userData, guestLimit, firebaseUser]);

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        userData,
        loading,
        isGuest,
        isAuthenticated,
        refreshUserData,
        showPaywall,
        setShowPaywall,
        checkGuestLimit,
      }}
    >
      {children}
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}
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
