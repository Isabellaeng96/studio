
"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Material, Transaction, TransactionSave, MaterialSave, CostCenter } from '@/types';
import { materials as initialMaterials, transactions as initialTransactions } from '@/lib/mock-data';

// Helper function to get item from localStorage safely
function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  try {
    const item = window.localStorage.getItem(key);
    // Se o item for 'undefined' (string), null, ou vazio, retorna o valor padrão
    if (item === null || item === 'undefined' || item === '') {
      return defaultValue;
    }
    return JSON.parse(item);
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
function generateId(prefix: string): string {
  const randomNumber = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}${Date.now()}${randomNumber}`;
}


interface AppContextType {
  materials: Material[];
  transactions: Transaction[];
  categories: string[];
  costCenters: CostCenter[];
  addMaterial: (material: MaterialSave) => void;
  addMultipleMaterials: (materials: MaterialSave[]) => void;
  updateMaterial: (material: MaterialSave & { id: string }) => void;
  deleteMaterial: (materialId: string) => void;
  deleteMultipleMaterials: (materialIds: string[]) => void;
  addCategory: (category: string) => void;
  addTransaction: (transaction: TransactionSave, type: 'entrada' | 'saida') => void;
  addCostCenter: (costCenter: Omit<CostCenter, 'id'>) => void;
  updateCostCenter: (costCenter: CostCenter) => void;
  deleteCostCenter: (costCenterId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load from storage only once
    if (!isLoaded) {
        const storedMaterials = getFromStorage<Material[]>('materials', []);
        if (storedMaterials.length > 0) {
             const formattedMaterials = storedMaterials.map(m => 
                (m.id && m.id.toString().startsWith('PRD')) ? m : { ...m, id: generateId('PRD') }
             );
            setMaterials(formattedMaterials);
            setTransactions(getFromStorage<Transaction[]>('transactions', []));
            setCategories(getFromStorage<string[]>('categories', []));
            setCostCenters(getFromStorage<CostCenter[]>('costCenters', []));
        } else {
            // LocalStorage is empty, load mock data and save it
            setMaterials(initialMaterials);
            setTransactions(initialTransactions);
            const uniqueCategories = new Set(initialMaterials.map(m => m.category).filter(c => c && c.trim() !== ''));
            const initialCats = Array.from(uniqueCategories);
            setCategories(initialCats);
            const initialCostCenters = [
                { id: 'cc-1', name: 'Projeto A', description: 'Desenvolvimento do novo loteamento' },
                { id: 'cc-2', name: 'Manutenção Geral', description: 'Custos de manutenção de rotina' },
            ];
            setCostCenters(initialCostCenters);
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

  useEffect(() => {
    if (isLoaded) {
      setInStorage('costCenters', costCenters);
    }
  }, [costCenters, isLoaded]);

  const addMaterial = (material: MaterialSave) => {
    const newMaterial: Material = {
      ...material,
      id: generateId('PRD'),
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
      id: generateId('PRD'),
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
      if (prev.includes(category)) return prev;
      const newCategories = new Set([...prev, category]);
      return Array.from(newCategories);
    });
  };

  const addTransaction = (transaction: TransactionSave, type: 'entrada' | 'saida') => {
    const material = materials.find(m => m.id === transaction.materialId);
    if (!material) return;
    
    const newTransaction: Transaction = {
      ...transaction,
      id: generateId('TRN'),
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

  const addCostCenter = (costCenter: Omit<CostCenter, 'id'>) => {
    const newCostCenter: CostCenter = {
      ...costCenter,
      id: generateId('CC'),
    };
    setCostCenters(prev => [newCostCenter, ...prev]);
  };

  const updateCostCenter = (costCenter: CostCenter) => {
    setCostCenters(prev => prev.map(cc => cc.id === costCenter.id ? costCenter : cc));
  };

  const deleteCostCenter = (costCenterId: string) => {
    setCostCenters(prev => prev.filter(cc => cc.id !== costCenterId));
  };

  const value = {
    materials,
    transactions,
    categories,
    costCenters,
    addMaterial,
    addMultipleMaterials,
    updateMaterial,
    deleteMaterial,
    deleteMultipleMaterials,
    addCategory,
    addTransaction,
    addCostCenter,
    updateCostCenter,
    deleteCostCenter,
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
