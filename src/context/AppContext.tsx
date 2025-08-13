
"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import type { Material, Transaction, TransactionSave, MaterialSave, CostCenter, Supplier, User } from '@/types';
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
  users: User[];
  activeMaterials: Material[]; // Materials that are not deleted
  addMaterial: (material: MaterialSave) => string | null;
  addMultipleMaterials: (materials: MaterialSave[]) => void;
  updateMaterial: (material: MaterialSave & { id: string }) => boolean;
  deleteMaterial: (materialId: string) => void;
  deleteMultipleMaterials: (materialIds: string[]) => void;
  addCategory: (category: string) => void;
  addTransaction: (transaction: TransactionSave, type: 'entrada' | 'saida') => boolean;
  addCostCenter: (costCenter: Omit<CostCenter, 'id'>) => void;
  updateCostCenter: (costCenter: CostCenter) => void;
  deleteCostCenter: (costCenterId: string) => void;
  getStockByLocation: (materialId: string) => Record<string, number>;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (supplier: Supplier) => void;
  deleteSupplier: (supplierId: string) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;
  getUserByEmail: (email: string) => User | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [users, setUsers] = useState<User[]>([]);
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
        setUsers(getFromStorage<User[]>('users', []));
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
        // Initial user setup
        const initialUsers = [
            // This user will be linked to the default auth user
            { id: 'usr-1', name: 'Usuário Admin', email: 'admin@geostoque.com.br', role: 'Administrador', sector: 'Engenharia' },
        ];
        setUsers(initialUsers);
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

  useEffect(() => {
    if (isLoaded) {
      setInStorage('users', users);
    }
  }, [users, isLoaded]);

  const activeMaterials = useMemo(() => materials.filter(m => !m.deleted), [materials]);

  const addMaterial = useCallback((material: MaterialSave): string | null => {
    const materialNameUpper = material.name.toUpperCase();
    
    const existingActiveMaterial = materials.find(
      (m) => !m.deleted && m.name.toUpperCase() === materialNameUpper
    );
    if (existingActiveMaterial) {
      toast({
        variant: 'destructive',
        title: 'Material Duplicado',
        description: `Um material com o nome "${material.name}" já existe.`,
      });
      return null;
    }
    
    const existingDeletedIndex = materials.findIndex(
      (m) => m.deleted && m.name.toUpperCase() === materialNameUpper
    );

    let materialId: string;
    if (existingDeletedIndex !== -1) {
      const updatedMaterial = {
          ...materials[existingDeletedIndex],
          ...material,
          name: materialNameUpper,
          supplier: material.supplier?.toUpperCase(),
          deleted: false
      };
      setMaterials(prev => {
        const newMaterials = [...prev];
        newMaterials[existingDeletedIndex] = updatedMaterial;
        return newMaterials;
      });
      materialId = updatedMaterial.id;
      toast({
        title: 'Material Reativado',
        description: `O material "${material.name}" foi reativado com o código existente.`,
      });
    } else {
      const newMaterial: Material = {
        ...material,
        name: materialNameUpper,
        supplier: material.supplier?.toUpperCase(),
        id: generateId('PRD'),
        currentStock: 0,
        deleted: false,
      };
      setMaterials(prev => [newMaterial, ...prev]);
      materialId = newMaterial.id;
    }

    if (!categories.includes(material.category)) {
      addCategory(material.category);
    }
    return materialId;
  }, [materials, categories, toast]);
  
  const addMultipleMaterials = (newMaterials: MaterialSave[]) => {
    let addedCount = 0;
    const newCategories = new Set(categories);

    // Create a mutable copy to work with
    const updatedMaterials = [...materials];

    newMaterials.forEach((material) => {
      const materialNameUpper = material.name.toUpperCase();
      // Check against the current state of updatedMaterials within the loop
      const existingActive = updatedMaterials.some(m => !m.deleted && m.name.toUpperCase() === materialNameUpper);

      if (existingActive) {
        return; // Skip if already exists and is active
      }
      
      const existingDeletedIndex = updatedMaterials.findIndex(m => m.deleted && m.name.toUpperCase() === materialNameUpper);

      if (existingDeletedIndex !== -1) {
        // Reactivate and update in the copied array
        updatedMaterials[existingDeletedIndex] = {
          ...updatedMaterials[existingDeletedIndex],
          ...material,
          name: materialNameUpper,
          supplier: material.supplier?.toUpperCase(),
          deleted: false,
        };
        addedCount++;
        if (material.category) newCategories.add(material.category);
      } else {
        // Add as new to the beginning of the copied array
        updatedMaterials.unshift({
          ...material,
          name: materialNameUpper,
          supplier: material.supplier?.toUpperCase(),
          id: generateId('PRD'),
          currentStock: 0,
          deleted: false,
        });
        addedCount++;
        if (material.category) newCategories.add(material.category);
      }
    });
    
    // Set the final state once
    setMaterials(updatedMaterials);
    if(newCategories.size > categories.length) {
      setCategories(Array.from(newCategories).sort());
    }
    
    const skippedCount = newMaterials.length - addedCount;

    if (addedCount > 0) {
      toast({
        title: 'Importação Concluída',
        description: `${addedCount} novos materiais foram cadastrados.`,
      });
    }

    if (skippedCount > 0) {
      toast({
        title: 'Materiais Ignorados',
        description: `${skippedCount} materiais foram ignorados pois já existiam no catálogo.`,
      });
    }
  };

  const updateMaterial = (material: MaterialSave & { id: string }) => {
    const materialNameUpper = material.name.toUpperCase();
    const existingMaterial = materials.find(
      (m) => !m.deleted && m.id !== material.id && m.name.toUpperCase() === materialNameUpper
    );

    if (existingMaterial) {
      toast({
        variant: 'destructive',
        title: 'Nome de Material Duplicado',
        description: `Outro material já existe com o nome "${material.name}".`,
      });
      return false;
    }

    setMaterials(prev => prev.map(m => m.id === material.id ? { ...m, ...material, name: materialNameUpper, supplier: material.supplier?.toUpperCase(), deleted: false } : m));
    if (!categories.includes(material.category)) {
      addCategory(material.category);
    }
    return true;
  };
  
  const deleteMaterial = (materialId: string) => {
    setMaterials(prev => prev.map(m => m.id === materialId ? { ...m, deleted: true } : m));
  };

  const deleteMultipleMaterials = (materialIds: string[]) => {
    setMaterials(prev => prev.map(m => materialIds.includes(m.id) ? { ...m, deleted: true } : m));
  };

  const addCategory = (category: string) => {
    setCategories(prev => {
      if (prev.includes(category)) return prev;
      const newCategories = new Set([...prev, category]);
      return Array.from(newCategories).sort();
    });
  };

  const addTransaction = (transaction: TransactionSave, type: 'entrada' | 'saida'): boolean => {
    if (type === 'entrada' && transaction.invoice && transaction.supplier) {
      const newInvoice = transaction.invoice.trim().toUpperCase();
      const newSupplier = transaction.supplier.trim().toUpperCase();

      const isDuplicate = transactions.some(tx => 
        tx.type === 'entrada' &&
        tx.invoice?.trim().toUpperCase() === newInvoice &&
        tx.supplier?.trim().toUpperCase() === newSupplier
      );

      if (isDuplicate) {
        toast({
          variant: 'destructive',
          title: 'Transação Duplicada',
          description: `Esta nota fiscal já foi registrada para o fornecedor "${transaction.supplier}".`,
        });
        return false;
      }
    }

    let materialId = transaction.materialId;
    
    if (!materialId && transaction.materialName && type === 'entrada') {
        const newMaterialId = addMaterial({
            name: transaction.materialName,
            category: transaction.category || 'GERAL',
            unit: transaction.unit || 'un',
            minStock: 0,
            supplier: transaction.supplier,
        });

        if (!newMaterialId) {
            return false;
        }
        materialId = newMaterialId;
    }

    const material = materials.find(m => m.id === materialId);
    if (!material) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Material não encontrado.' });
        return false;
    }
    
    const newTransaction: Transaction = {
      id: generateId('TRN'),
      type: type,
      date: transaction.date.getTime(),
      materialId: material.id,
      materialName: material.name,
      quantity: transaction.quantity,
      responsible: transaction.responsible,
      supplier: transaction.supplier?.toUpperCase(),
      invoice: transaction.invoice,
      osNumber: transaction.osNumber,
      workFront: transaction.workFront,
      costCenter: transaction.costCenter,
      stockLocation: transaction.stockLocation,
    };

    setTransactions(prev => [newTransaction, ...prev]);

    setMaterials(prev => prev.map(m => {
      if (m.id === materialId) {
        const newStock = type === 'entrada'
          ? m.currentStock + transaction.quantity
          : m.currentStock - transaction.quantity;
        return { ...m, currentStock: newStock };
      }
      return m;
    }));
    
    toast({
        title: 'Transação Registrada',
        description: `Uma nova transação de ${type} de ${transaction.quantity} unidades foi salva.`,
    });
    
    return true;
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

  const addUser = (user: Omit<User, 'id'>) => {
    if (users.some(u => u.email.toLowerCase() === user.email.toLowerCase())) {
        toast({
            variant: 'destructive',
            title: 'Email já Cadastrado',
            description: 'Este endereço de e-mail já está em uso.',
        });
        return;
    }
    const newUser: User = {
        ...user,
        id: generateId('USR'),
    };
    setUsers(prev => [newUser, ...prev]);
  };

  const updateUser = (user: User) => {
    setUsers(prev => prev.map(u => u.id === user.id ? user : u));
  };

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const getUserByEmail = useCallback((email: string): User | undefined => {
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }, [users]);


  const value = {
    materials,
    transactions,
    categories,
    costCenters,
    suppliers,
    users,
    activeMaterials,
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
    addUser,
    updateUser,
    deleteUser,
    getUserByEmail,
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
