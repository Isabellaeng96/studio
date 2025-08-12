
"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Material, Transaction, TransactionSave, MaterialSave } from '@/types';
import { materials as initialMaterials, transactions as initialTransactions } from '@/lib/mock-data';

// Helper function to get item from localStorage safely
function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key “${key}”:`, error);
    return defaultValue;
  }
}

// Helper function to set item in localStorage safely
function setInStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage key “${key}”:`, error);
  }
}


// Helper function to generate a unique product ID
function generateProductId(): string {
  const randomNumber = Math.floor(10000000 + Math.random() * 90000000);
  return `PRD${randomNumber}`;
}


interface AppContextType {
  materials: Material[];
  transactions: Transaction[];
  categories: string[];
  addMaterial: (material: MaterialSave) => void;
  addMultipleMaterials: (materials: MaterialSave[]) => void;
  updateMaterial: (material: MaterialSave & { id: string }) => void;
  deleteMaterial: (materialId: string) => void;
  deleteMultipleMaterials: (materialIds: string[]) => void;
  addCategory: (category: string) => void;
  addTransaction: (transaction: TransactionSave, type: 'entrada' | 'saida') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load from storage only once
    if (typeof window !== 'undefined' && !isLoaded) {
      setMaterials(getFromStorage('materials', initialMaterials));
      setTransactions(getFromStorage('transactions', initialTransactions));
      
      const storedCategories = getFromStorage<string[]>('categories', []);
      if (storedCategories.length > 0) {
        setCategories(storedCategories);
      } else {
        const uniqueCategories = new Set(initialMaterials.map(m => m.category));
        setCategories(Array.from(uniqueCategories));
      }
      setIsLoaded(true);
    }
  }, [isLoaded]);


  useEffect(() => {
    if (isLoaded) {
      setInStorage('materials', materials);
    }
  }, [materials, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      setInStorage('transactions', transactions);
    }
  }, [transactions, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      setInStorage('categories', categories);
    }
  }, [categories, isLoaded]);

  const addMaterial = (material: MaterialSave) => {
    const newMaterial: Material = {
      ...material,
      id: generateProductId(),
      currentStock: 0,
    };
    setMaterials(prev => [newMaterial, ...prev]);
    if (!categories.includes(newMaterial.category)) {
      addCategory(newMaterial.category);
    }
  };
  
  const addMultipleMaterials = (newMaterials: MaterialSave[]) => {
    const materialsToAdd: Material[] = newMaterials.map((material) => ({
      ...material,
      id: generateProductId(),
      currentStock: 0,
    }));
    
    setMaterials(prev => [...materialsToAdd, ...prev]);
    
    const newCategories = new Set(categories);
    materialsToAdd.forEach(m => newCategories.add(m.category));
    setCategories(Array.from(newCategories));
  };

  const updateMaterial = (material: MaterialSave & { id: string }) => {
    setMaterials(prev => prev.map(m => m.id === material.id ? { ...m, ...material } : m));
    if (!categories.includes(material.category)) {
      addCategory(material.category);
    }
  };
  
  const deleteMaterial = (materialId: string) => {
    setMaterials(prev => prev.filter(m => m.id !== materialId));
  };

  const deleteMultipleMaterials = (materialIds: string[]) => {
    setMaterials(prev => prev.filter(m => !materialIds.includes(m.id)));
  };

  const addCategory = (category: string) => {
    setCategories(prev => {
      const newCategories = new Set([...prev, category]);
      return Array.from(newCategories);
    });
  };

  const addTransaction = (transaction: TransactionSave, type: 'entrada' | 'saida') => {
    const material = materials.find(m => m.id === transaction.materialId);
    if (!material) return;
    
    const newTransaction: Transaction = {
      ...transaction,
      id: `trn-${Date.now()}`,
      type: type,
      date: transaction.date.getTime(),
      materialName: material.name,
    };

    setTransactions(prev => [newTransaction, ...prev]);

    // Update stock
    setMaterials(prev => prev.map(m => {
      if (m.id === transaction.materialId) {
        const newStock = type === 'entrada'
          ? m.currentStock + transaction.quantity
          : m.currentStock - transaction.quantity;
        return { ...m, currentStock: newStock };
      }
      return m;
    }));
  };

  const value = {
    materials,
    transactions,
    categories,
    addMaterial,
    addMultipleMaterials,
    updateMaterial,
    deleteMaterial,
    deleteMultipleMaterials,
    addCategory,
    addTransaction,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
