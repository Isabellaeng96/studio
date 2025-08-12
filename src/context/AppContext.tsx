"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import type { Material, Transaction, TransactionSave, MaterialSave } from '@/types';
import { materials as initialMaterials, transactions as initialTransactions } from '@/lib/mock-data';

interface AppContextType {
  materials: Material[];
  transactions: Transaction[];
  categories: string[];
  addMaterial: (material: MaterialSave) => void;
  updateMaterial: (material: MaterialSave & { id: string }) => void;
  deleteMaterial: (materialId: string) => void;
  addCategory: (category: string) => void;
  addTransaction: (transaction: TransactionSave, type: 'entrada' | 'saida') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [categories, setCategories] = useState<string[]>(() => {
    const uniqueCategories = new Set(initialMaterials.map(m => m.category));
    return Array.from(uniqueCategories);
  });

  const addMaterial = (material: MaterialSave) => {
    const newMaterial: Material = {
      ...material,
      id: `mat-${Date.now()}`,
      currentStock: 0,
    };
    setMaterials(prev => [newMaterial, ...prev]);
  };

  const updateMaterial = (material: MaterialSave & { id: string }) => {
    setMaterials(prev => prev.map(m => m.id === material.id ? { ...m, ...material } : m));
  };
  
  const deleteMaterial = (materialId: string) => {
    setMaterials(prev => prev.filter(m => m.id !== materialId));
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
    updateMaterial,
    deleteMaterial,
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
