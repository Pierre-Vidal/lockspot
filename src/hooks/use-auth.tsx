import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

import * as authService from '@/services/auth';
import type { AppUser } from '@/types/auth';

type AuthContextValue = {
  // null si personne n'est connecté
  user: AppUser | null;
  // true pendant que Firebase retrouve la session
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (username: string, email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  // Pendant l'inscription, on attend que le pseudo soit enregistré
  const signingUp = useRef(false);

  useEffect(() => {
    return authService.subscribeToAuthChanges((nextUser) => {
      if (signingUp.current) return;
      setUser(nextUser);
      setLoading(false);
    });
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    signIn: authService.signIn,
    resetPassword: authService.resetPassword,
    signOut: authService.signOut,
    deleteAccount: authService.deleteAccount,
    signUp: async (username, email, password) => {
      signingUp.current = true;
      try {
        setUser(await authService.signUp(username, email, password));
      } finally {
        signingUp.current = false;
      }
    },
  };

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l’intérieur de <AuthProvider>.');
  }
  return context;
}
