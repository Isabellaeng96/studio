
"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { Material, Transaction, TransactionSave, MaterialSave, CostCenter, Supplier } from '@/types';
import { materials as initialMaterials, transactions as initialTransactions } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';

// Helper function to get item from localStorage safely
function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  try {
    const item = window.localStorage.getItem(key);
    // If the item is 'undefined' (string), null, or empty, return the default value
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
  if (prefix === 'PRD') {
    // Ensure an 8-digit random number
    const randomNumber = Math.floor(10000000 + Math.random() * 90000000);
    return `${prefix}${randomNumber}`;
  }
  const randomNumber = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}${Date.now()}${randomNumber}`;
}


interface AppContextType {
  materials: Material[];
  transactions: Transaction[];
  categories: string[];
  costCenters: CostCenter[];
  suppliers: Supplier[];
  addMaterial: (material: MaterialSave) => boolean;
  addMultipleMaterials: (materials: MaterialSave[]) => void;
  updateMaterial: (material: MaterialSave & { id: string }) => boolean;
  deleteMaterial: (materialId: string) => void;
  deleteMultipleMaterials: (materialIds: string[]) => void;
  addCategory: (category: string) => void;
  addTransaction: (transaction: TransactionSave, type: 'entrada' | 'saida') => void;
  addCostCenter: (costCenter: Omit<CostCenter, 'id'>) => void;
  updateCostCenter: (costCenter: CostCenter) => void;
  deleteCostCenter: (costCenterId: string) => void;
  getStockByLocation: (materialId: string) => Record<string, number>;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (supplier: Supplier) => void;
  deleteSupplier: (supplierId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load from storage only once
    const storedMaterials = getFromStorage<Material[]>('materials', []);
    if (storedMaterials.length > 0) {
        setMaterials(storedMaterials);
        setTransactions(getFromStorage<Transaction[]>('transactions', []));
        setCategories(getFromStorage<string[]>('categories', []));
        setCostCenters(getFromStorage<CostCenter[]>('costCenters', []));
        setSuppliers(getFromStorage<Supplier[]>('suppliers', []));
    } else {
        // LocalStorage is empty, load mock data
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
        const initialSuppliers = [
          { id: 'sup-1', name: 'VOTORANTIM', cnpj: '01.234.567/0001-89', contactName: 'Ana Costa', phone: '11 98765-4321', email: 'ana.costa@votorantim.com.br' },
          { id: 'sup-2', name: 'TIGRE', cnpj: '98.765.432/0001-10', contactName: 'Carlos Silva', phone: '47 3441-4444', email: 'vendas@tigre.com' },
        ];
        setSuppliers(initialSuppliers);
    }
    setIsLoaded(true);
  }, []);


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

  useEffect(() => {
    if (isLoaded) {
      setInStorage('suppliers', suppliers);
    }
  }, [suppliers, isLoaded]);

  const addMaterial = (material: MaterialSave) => {
    const materialNameUpper = material.name.toUpperCase();
    const existingMaterial = materials.find(
      (m) => m.name.toUpperCase() === materialNameUpper
    );

    if (existingMaterial) {
      toast({
        variant: 'destructive',
        title: 'Material Duplicado',
        description: `Um material com o nome "${material.name}" já existe.`,
      });
      return false;
    }

    const newMaterial: Material = {
      ...material,
      name: materialNameUpper,
      supplier: material.supplier?.toUpperCase(),
      id: generateId('PRD'),
      currentStock: 0,
    };
    setMaterials(prev => [newMaterial, ...prev]);
    if (!categories.includes(newMaterial.category)) {
      addCategory(newMaterial.category);
    }
    return true;
  };
  
  const addMultipleMaterials = (newMaterials: MaterialSave[]) => {
    const materialsToAdd: Material[] = [];
    const newCategories = new Set(categories);

    newMaterials.forEach((material) => {
      const materialNameUpper = material.name.toUpperCase();
      const existing = materials.some(m => m.name.toUpperCase() === materialNameUpper);
      if (!existing) {
        materialsToAdd.push({
          ...material,
          name: materialNameUpper,
          supplier: material.supplier?.toUpperCase(),
          id: generateId('PRD'),
          currentStock: 0,
        });
        if (material.category) {
            newCategories.add(material.category);
        }
      }
    });

    setMaterials(prev => [...materialsToAdd, ...prev]);
    setCategories(Array.from(newCategories));
    
    const skippedCount = newMaterials.length - materialsToAdd.length;
    if (skippedCount > 0) {
      toast({
        variant: 'destructive',
        title: 'Materiais Duplicados Ignorados',
        description: `${skippedCount} materiais não foram importados pois já existem.`,
      });
    }
  };

  const updateMaterial = (material: MaterialSave & { id: string }) => {
    const materialNameUpper = material.name.toUpperCase();
    const existingMaterial = materials.find(
      (m) => m.id !== material.id && m.name.toUpperCase() === materialNameUpper
    );

    if (existingMaterial) {
      toast({
        variant: 'destructive',
        title: 'Nome de Material Duplicado',
        description: `Outro material já existe com o nome "${material.name}".`,
      });
      return false;
    }

    setMaterials(prev => prev.map(m => m.id === material.id ? { ...m, ...material, name: materialNameUpper, supplier: material.supplier?.toUpperCase() } : m));
    if (!categories.includes(material.category)) {
      addCategory(material.category);
    }
    return true;
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
    // Check for duplicate invoice on entry
    if (type === 'entrada' && transaction.invoice && transaction.supplier) {
      const isDuplicate = transactions.some(
        tx => tx.type === 'entrada' &&
              tx.invoice === transaction.invoice &&
              tx.supplier?.toUpperCase() === transaction.supplier?.toUpperCase()
      );
      if (isDuplicate) {
        toast({
          variant: 'destructive',
          title: 'Transação Duplicada',
          description: `Esta nota fiscal já foi registrada para o fornecedor "${transaction.supplier}".`,
        });
        return; // Stop the function
      }
    }

    const material = materials.find(m => m.id === transaction.materialId);
    if (!material) return;
    
    const newTransaction: Transaction = {
      ...transaction,
      id: generateId('TRN'),
      type: type,
      date: transaction.date.getTime(),
      materialName: material.name,
      supplier: transaction.supplier?.toUpperCase(),
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
  
  const getStockByLocation = useCallback((materialId: string): Record<string, number> => {
    const stockMap: Record<string, number> = {};
    const materialTransactions = transactions.filter(t => t.materialId === materialId);

    materialTransactions.forEach(t => {
      const location = t.stockLocation || 'Não especificado';
      if (!stockMap[location]) {
        stockMap[location] = 0;
      }
      if (t.type === 'entrada') {
        stockMap[location] += t.quantity;
      } else {
        stockMap[location] -= t.quantity;
      }
    });

    // Remove locations with zero or negative stock to keep it clean
    Object.keys(stockMap).forEach(key => {
      if (stockMap[key] <= 0) {
        delete stockMap[key];
      }
    });

    return stockMap;
  }, [transactions]);

  const addSupplier = (supplier: Omit<Supplier, 'id'>) => {
    const newSupplier: Supplier = {
      ...supplier,
      name: supplier.name.toUpperCase(),
      id: generateId('SUP'),
    };
    setSuppliers(prev => [newSupplier, ...prev]);
  };

  const updateSupplier = (supplier: Supplier) => {
    setSuppliers(prev => prev.map(s => s.id === supplier.id ? { ...supplier, name: supplier.name.toUpperCase() } : s));
  };

  const deleteSupplier = (supplierId: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== supplierId));
  };


  const value = {
    materials,
    transactions,
    categories,
    costCenters,
    suppliers,
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
    getStockByLocation,
    addSupplier,
    updateSupplier,
    deleteSupplier,
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
