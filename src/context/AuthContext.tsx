// src/context/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updatePassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useAppContext } from './AppContext';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: string;
  sector: string;
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
  const [role, setRole] = useState('Visitante');
  const [sector, setSector] = useState('');
  const router = useRouter();
  const appContext = useAppContext();


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user && appContext) {
         const appUser = appContext.getUserByEmail(user.email || '');
         if (appUser) {
           setRole(appUser.role);
           setSector(appUser.sector);
         } else {
            // Default role if user is not in our custom user list
            setRole('Visitante');
            setSector('');
         }
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, appContext]);

  const login = (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
  };
  
  const signup = async (email: string, pass: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    if (userCredential.user) {
        await updateProfile(userCredential.user, {
            displayName: name
        });
        // Add user to our app context as well
        if (appContext) {
            appContext.addUser({ name, email, role: 'Administrador', sector: 'Engenharia' });
        }
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
    
    // Also update in our user list
     if (appContext && auth.currentUser?.email) {
        const appUser = appContext.getUserByEmail(auth.currentUser.email);
        if (appUser) {
            appContext.updateUser({ ...appUser, name });
        }
    }
  };


  const value = {
    user,
    loading,
    role,
    sector,
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
