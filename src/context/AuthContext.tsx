// src/context/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updatePassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useAppContext } from './AppContext';
import type { User as AppUser } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: string | null;
  login: (email: string, pass: string) => Promise<any>;
  signup: (email: string, pass: string, name: string) => Promise<any>;
  logout: () => Promise<void>;
  updateUserPassword: (password: string) => Promise<void>;
  updateUserProfile: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();
  const appContext = useAppContext();


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        // For simplicity, all logged-in users are admins for now.
        // This can be expanded with a user management system.
        setRole("Administrador");
      } else {
        setRole(null);
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const login = (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
  };
  
  const signup = async (email: string, pass: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    if (userCredential.user) {
        await updateProfile(userCredential.user, {
            displayName: name
        });
    }
    return userCredential;
  };

  const logout = async () => {
    await signOut(auth);
    router.push('/login');
  };
  
  const updateUserPassword = (password: string) => {
      if (!auth.currentUser) {
        throw new Error("Nenhum usuário logado para atualizar a senha.");
      }
      return updatePassword(auth.currentUser, password);
  }
  
  const updateUserProfile = async (name: string) => {
    if (!auth.currentUser) {
      throw new Error("Nenhum usuário logado para atualizar o perfil.");
    }
    await updateProfile(auth.currentUser, { displayName: name });
    // Manually update the user object in state to reflect the change immediately
    setUser(auth.currentUser ? { ...auth.currentUser } : null);
  };


  const value = {
    user,
    loading,
    role,
    login,
    signup,
    logout,
    updateUserPassword,
    updateUserProfile,
  };

  // We need to make sure AppContext is loaded before rendering children
  if (appContext === undefined && !loading) {
    return null; // Or a loading indicator
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
