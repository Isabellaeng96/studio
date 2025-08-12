// src/context/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updatePassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: string; // Add role
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
  const router = useRouter();

  // For demonstration, we'll hardcode the role.
  // In a real app, this would come from a database (like Firestore)
  // after the user logs in.
  const role = "Administrador";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (!user) {
        router.push('/login');
      }
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
