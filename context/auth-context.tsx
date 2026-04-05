'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signOut, GoogleAuthProvider, signInWithPopup, setPersistence, browserLocalPersistence, getIdTokenResult } from 'firebase/auth';
import { auth, getFirebaseDb } from '@/lib/firebase';
import { ref, get } from 'firebase/database';

interface AuthUser extends User {
  role?: 'admin' | 'candidate';
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
        
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
          if (currentUser) {
            try {
              // Prefer checking admin via ID token custom claim
              const idToken = await getIdTokenResult(currentUser)
              const isAdminClaim = !!(idToken && idToken.claims && (idToken.claims as any).admin)

              // Allow a dev override via NEXT_PUBLIC_DEV_ADMIN_UID for local development
              const devAdmin = process.env.NEXT_PUBLIC_DEV_ADMIN_UID && process.env.NEXT_PUBLIC_DEV_ADMIN_UID === currentUser.uid

              if (isAdminClaim || devAdmin) {
                setUser({ ...currentUser, role: 'admin' })
                return
              }

              // Fallback: try reading legacy `admins/${uid}` entry if present (may be blocked by rules)
              try {
                const db = getFirebaseDb()
                const adminRef = ref(db, `admins/${currentUser.uid}`)
                const adminSnapshot = await get(adminRef)
                const authUser: AuthUser = {
                  ...currentUser,
                  role: adminSnapshot.exists() ? 'admin' : 'candidate',
                }
                setUser(authUser)
                return
              } catch (innerErr) {
                // If reading admins is not permitted, default to candidate (non-blocking)
                console.warn('Could not read admins node, defaulting to candidate role', innerErr)
                setUser({ ...currentUser, role: 'candidate' })
                return
              }
            } catch (error: any) {
              console.error('Error checking admin status:', error)
              setUser({ ...currentUser, role: 'candidate' })
            }
          } else {
            setUser(null)
          }
          setLoading(false)
        })

        return unsubscribe;
      } catch (error) {
        console.error('Auth initialization error:', error);
        setLoading(false);
      }
    };

    const unsubscribe = initializeAuth();
    return () => {
      unsubscribe?.then(fn => fn?.());
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (error) {
      const err: any = error;
      // User closed the OAuth popup — not an actionable error.
      if (err?.code === 'auth/popup-closed-by-user' || err?.message?.includes('popup closed')) {
        console.info('Sign in popup closed by user');
        return;
      }
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
