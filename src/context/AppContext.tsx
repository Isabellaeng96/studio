
"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import type { Material, Transaction, TransactionSave, MaterialSave, CostCenter, Supplier, AlertSetting, SectorEmailConfig } from '@/types';
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
    const timestamp = Date.now();
    const randomNumber = Math.floor(Math.random() * 1000000);
    return `${prefix}-${timestamp}-${randomNumber}`;
}


interface AppContextType {
  materials: Material[];
  transactions: Transaction[];
  categories: string[];
  costCenters: CostCenter[];
  suppliers: Supplier[];
  activeMaterials: Material[]; // Materials that are not deleted
  addMaterial: (material: MaterialSave) => string | null;
  addMultipleMaterials: (materials: MaterialSave[]) => { messages: {variant: "default" | "destructive", title: string, description: string}[] };
  updateMaterial: (material: MaterialSave & { id: string }) => string | null;
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
  // Alert Settings
  alertSettings: AlertSetting[];
  availableSectors: string[];
  updateAlertSetting: (materialId: string, sectors: string[]) => void;
  sectorEmailConfig: SectorEmailConfig;
  addEmailToSector: (sector: string, email: string) => void;
  removeEmailFromSector: (sector: string, email: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [alertSettings, setAlertSettings] = useState<AlertSetting[]>([]);
  const [sectorEmailConfig, setSectorEmailConfig] = useState<SectorEmailConfig>({});

  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  const availableSectors = useMemo(() => ['Engenharia', 'Manutenção', 'Compras'], []);
  
  const loadStateFromStorage = useCallback(() => {
    const storedMaterials = getFromStorage<Material[]>('materials', []);
    if (storedMaterials.length > 0) {
      setMaterials(storedMaterials);
      setTransactions(getFromStorage<Transaction[]>('transactions', []));
      setCategories(getFromStorage<string[]>('categories', []));
      setCostCenters(getFromStorage<CostCenter[]>('costCenters', []));
      setSuppliers(getFromStorage<Supplier[]>('suppliers', []));
      setAlertSettings(getFromStorage<AlertSetting[]>('alertSettings', []));
      setSectorEmailConfig(getFromStorage<SectorEmailConfig>('sectorEmailConfig', {}));
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

      // Default alert settings: notify Engineering for all low-stock items
      const initialAlertSettings = initialMaterials
        .map(m => ({ materialId: m.id, sectors: ['Engenharia'] }));
      setAlertSettings(initialAlertSettings);
      setSectorEmailConfig({
        'Engenharia': ['tec08@geoblue.com.br'],
        'Manutenção': ['tec08@geoblue.com.br'],
        'Compras': ['compras@geoblue.com.br'],
      });
    }
  }, []);

  useEffect(() => {
    // Load from storage only once on initial load
    loadStateFromStorage();
    setIsLoaded(true);
    
    // Add event listener for storage changes from other tabs
    const handleStorageChange = () => {
      console.log("Storage changed in another tab. Reloading state.");
      loadStateFromStorage();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };

  }, [loadStateFromStorage]);


  useEffect(() => { if (isLoaded) setInStorage('materials', materials); }, [materials, isLoaded]);
  useEffect(() => { if (isLoaded) setInStorage('transactions', transactions); }, [transactions, isLoaded]);
  useEffect(() => { if (isLoaded) setInStorage('categories', categories); }, [categories, isLoaded]);
  useEffect(() => { if (isLoaded) setInStorage('costCenters', costCenters); }, [costCenters, isLoaded]);
  useEffect(() => { if (isLoaded) setInStorage('suppliers', suppliers); }, [suppliers, isLoaded]);
  useEffect(() => { if (isLoaded) setInStorage('alertSettings', alertSettings); }, [alertSettings, isLoaded]);
  useEffect(() => { if (isLoaded) setInStorage('sectorEmailConfig', sectorEmailConfig); }, [sectorEmailConfig, isLoaded]);


  const activeMaterials = useMemo(() => materials.filter(m => !m.deleted), [materials]);

  const addCategory = useCallback((category: string) => {
    setCategories(prev => {
      if (prev.includes(category)) return prev;
      const newCategories = new Set([...prev, category]);
      return Array.from(newCategories).sort();
    });
  }, []);

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
  }, [materials, categories, toast, addCategory]);
  
  const addMultipleMaterials = useCallback((newMaterials: MaterialSave[]) => {
    const messages: {variant: "default" | "destructive", title: string, description: string}[] = [];
    const newCategories = new Set(categories);
    let addedCount = 0;
    
    setMaterials(prevMaterials => {
      const updatedMaterials = [...prevMaterials];
      
      newMaterials.forEach((material) => {
        const materialNameUpper = material.name.toUpperCase();
        const existingActive = updatedMaterials.some(m => !m.deleted && m.name.toUpperCase() === materialNameUpper);
    
        if (existingActive) {
          return; // Skip if already exists and is active
        }
        
        const existingDeletedIndex = updatedMaterials.findIndex(m => m.deleted && m.name.toUpperCase() === materialNameUpper);
    
        if (existingDeletedIndex !== -1) {
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
      
      return updatedMaterials;
    });

    if (newCategories.size > categories.length) {
      setCategories(Array.from(newCategories).sort());
    }
    
    const skippedCount = newMaterials.length - addedCount;
    
    if (addedCount > 0) {
      messages.push({
        variant: "default",
        title: 'Importação Concluída',
        description: `${addedCount} materiais foram importados com sucesso.`,
      });
    }
    if (skippedCount > 0) {
      messages.push({
        variant: "default",
        title: 'Materiais Ignorados',
        description: `${skippedCount} materiais foram ignorados pois já existiam.`,
      });
    }

    return { messages };
  }, [categories]);

  const updateMaterial = useCallback((material: MaterialSave & { id: string }): string | null => {
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
      return null;
    }

    setMaterials(prev => prev.map(m => m.id === material.id ? { ...m, ...material, name: materialNameUpper, supplier: material.supplier?.toUpperCase(), deleted: false } : m));
    if (!categories.includes(material.category)) {
      addCategory(material.category);
    }
    return material.id;
  }, [materials, categories, toast, addCategory]);
  
  const deleteMaterial = useCallback((materialId: string) => {
    setMaterials(prev => prev.map(m => m.id === materialId ? { ...m, deleted: true } : m));
  }, []);

  const deleteMultipleMaterials = useCallback((materialIds: string[]) => {
    setMaterials(prev => prev.map(m => materialIds.includes(m.id) ? { ...m, deleted: true } : m));
  }, []);

  const checkAndSendAlert = useCallback((material: Material) => {
    if (material.currentStock < material.minStock) {
      const setting = alertSettings.find(s => s.materialId === material.id);
      if (!setting || setting.sectors.length === 0) return;
  
      const recipientEmails = new Set<string>();
      setting.sectors.forEach(sector => {
        const emails = sectorEmailConfig[sector];
        if (emails) {
          emails.forEach(email => recipientEmails.add(email));
        }
      });
  
      if (recipientEmails.size > 0) {
        console.log(`-- SIMULATING EMAIL ALERT --`);
        console.log(`To: ${Array.from(recipientEmails).join(', ')}`);
        console.log(`Subject: Alerta de Estoque Baixo - ${material.name}`);
        console.log(`Body: O material "${material.name}" (ID: ${material.id}) está com estoque baixo.`);
        console.log(`   - Estoque Atual: ${material.currentStock}`);
        console.log(`   - Estoque Mínimo: ${material.minStock}`);
        console.log(`-----------------------------`);
        toast({
            title: `Alerta de Estoque Baixo: ${material.name}`,
            description: `Notificação (simulada) enviada para: ${setting.sectors.join(', ')}`,
        })
      }
    }
  }, [alertSettings, sectorEmailConfig, toast]);

  const addTransaction = useCallback((transaction: TransactionSave, type: 'entrada' | 'saida'): boolean => {
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

    if (!materialId) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Material não encontrado.' });
        return false;
    }
    
    let wasSuccessful = false;
    let materialForAlert: Material | undefined;

    setMaterials(prev => {
      const newMaterials = [...prev];
      const index = newMaterials.findIndex(m => m.id === materialId);
      if (index === -1) {
        wasSuccessful = false;
        return prev;
      };

      const currentMaterial = newMaterials[index];
      const newStock = type === 'entrada'
        ? currentMaterial.currentStock + transaction.quantity
        : currentMaterial.currentStock - transaction.quantity;
      
      if (type === 'saida' && newStock < 0) {
          toast({
              variant: 'destructive',
              title: 'Estoque Insuficiente',
              description: `Não há estoque suficiente de "${currentMaterial.name}" para esta saída.`,
          });
          wasSuccessful = false;
          return prev;
      }
      
      const updatedMaterial = { ...currentMaterial, currentStock: newStock };
      newMaterials[index] = updatedMaterial;
      wasSuccessful = true;
      if(type === 'saida') {
        materialForAlert = updatedMaterial;
      }
      return newMaterials;
    });

    if (wasSuccessful && materialId) {
        const materialName = materials.find(m => m.id === materialId)?.name || transaction.materialName;
        if (!materialName) return false;

        const newTransaction: Transaction = {
          id: generateId('TRN'),
          type: type,
          date: transaction.date.getTime(),
          materialId: materialId,
          materialName: materialName,
          quantity: transaction.quantity,
          responsible: transaction.responsible,
          supplier: transaction.supplier?.toUpperCase(),
          invoice: transaction.invoice,
          osNumber: transaction.osNumber,
          costCenter: transaction.costCenter,
          stockLocation: transaction.stockLocation,
        };
        setTransactions(prev => [newTransaction, ...prev]);

        toast({
            title: 'Transação Registrada',
            description: `Uma nova transação de ${type} de ${transaction.quantity} unidades foi salva.`,
        });

        if (materialForAlert) {
            checkAndSendAlert(materialForAlert);
        }
        return true;
    }
    
    return false;
  }, [materials, transactions, toast, addMaterial, checkAndSendAlert]);

  const addCostCenter = useCallback((costCenter: Omit<CostCenter, 'id'>) => {
    const newCostCenter: CostCenter = {
      ...costCenter,
      id: generateId('CC'),
    };
    setCostCenters(prev => [newCostCenter, ...prev]);
  }, []);

  const updateCostCenter = useCallback((costCenter: CostCenter) => {
    setCostCenters(prev => prev.map(cc => cc.id === costCenter.id ? costCenter : cc));
  }, []);

  const deleteCostCenter = useCallback((costCenterId: string) => {
    setCostCenters(prev => prev.filter(cc => cc.id !== costCenterId));
  }, []);
  
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

  const addSupplier = useCallback((supplier: Omit<Supplier, 'id'>) => {
    const newSupplier: Supplier = {
      ...supplier,
      name: supplier.name.toUpperCase(),
      id: generateId('SUP'),
    };
    setSuppliers(prev => [newSupplier, ...prev]);
  }, []);

  const updateSupplier = useCallback((supplier: Supplier) => {
    setSuppliers(prev => prev.map(s => s.id === supplier.id ? { ...supplier, name: supplier.name.toUpperCase() } : s));
  }, []);

  const deleteSupplier = useCallback((supplierId: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== supplierId));
  }, []);
  
  const updateAlertSetting = useCallback((materialId: string, sectors: string[]) => {
    setAlertSettings(prev => {
      const existingSettingIndex = prev.findIndex(s => s.materialId === materialId);
      const newSettings = [...prev];

      if (existingSettingIndex > -1) {
        if (sectors.length === 0) {
          // Remove the setting if no sectors are selected
          newSettings.splice(existingSettingIndex, 1);
        } else {
          // Update existing setting
          newSettings[existingSettingIndex] = { ...newSettings[existingSettingIndex], sectors };
        }
      } else if (sectors.length > 0) {
        // Add new setting
        newSettings.push({ materialId, sectors });
      }
      
      return newSettings;
    });
  }, []);

  const addEmailToSector = useCallback((sector: string, email: string) => {
    setSectorEmailConfig(prev => {
        const currentEmails = prev[sector] || [];
        if (currentEmails.includes(email)) {
            toast({
                variant: "destructive",
                title: "E-mail Duplicado",
                description: `O e-mail ${email} já está cadastrado para o setor ${sector}.`
            });
            return prev;
        }
        return {
            ...prev,
            [sector]: [...currentEmails, email]
        };
    });
  }, [toast]);

  const removeEmailFromSector = useCallback((sector: string, emailToRemove: string) => {
    setSectorEmailConfig(prev => {
        const currentEmails = prev[sector] || [];
        return {
            ...prev,
            [sector]: currentEmails.filter(email => email !== emailToRemove)
        };
    });
  }, []);


  const value = {
    materials,
    transactions,
    categories,
    costCenters,
    suppliers,
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
    alertSettings,
    availableSectors,
    updateAlertSetting,
    sectorEmailConfig,
    addEmailToSector,
    removeEmailFromSector,
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
