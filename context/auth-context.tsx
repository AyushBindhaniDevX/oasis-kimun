'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signOut, GoogleAuthProvider, signInWithPopup, setPersistence, browserLocalPersistence } from 'firebase/auth';
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
              // Check admin status via client SDK (requires DB rules that allow
              // reading/writing the user's own admin record).
              const db = getFirebaseDb()
              const adminRef = ref(db, `admins/${currentUser.uid}`)
              const adminSnapshot = await get(adminRef)

              const authUser: AuthUser = {
                ...currentUser,
                role: adminSnapshot.exists() ? 'admin' : 'candidate',
              }
              setUser(authUser)
            } catch (error: any) {
              // If permission denied, assume candidate role
              if (error?.code === 'PERMISSION_DENIED' || error?.message?.includes('Permission denied')) {
                const authUser: AuthUser = {
                  ...currentUser,
                  role: 'candidate'
                }
                setUser(authUser)
              } else {
                console.error('Error checking admin status:', error)
                setUser({
                  ...currentUser,
                  role: 'candidate'
                })
              }
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
