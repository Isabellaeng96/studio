

"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import type { Material, Transaction, TransactionSave, MaterialSave, CostCenter, Supplier, AlertSetting, SectorEmailConfig, MultiTransactionItemSave, EntryItem } from '@/types';
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
    const randomNumber = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    return `${prefix}${randomNumber}`;
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
  addMultipleEntries: (items: EntryItem[], commonData: Omit<TransactionSave, 'materialId' | 'quantity' | 'materialName' | 'unit' | 'category'>) => boolean;
  addMultipleTransactions: (items: MultiTransactionItemSave[], commonData: Omit<TransactionSave, 'materialId' | 'quantity'>) => boolean;
  addCostCenter: (costCenter: Omit<CostCenter, 'id'>) => void;
  updateCostCenter: (costCenter: CostCenter) => void;
  deleteCostCenter: (costCenterId: string) => void;
  getStockByLocation: (materialId: string) => Record<string, number>;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (supplier: Supplier) => void;
  deleteSupplier: (supplierId: string) => void;
  addMultipleSuppliers: (suppliers: Omit<Supplier, 'id'>[]) => { messages: { variant: "default" | "destructive", title: string, description: string }[] };
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
    // Always load from storage. If it's the very first run, it will load empty arrays.
    setMaterials(getFromStorage<Material[]>('materials', []));
    setTransactions(getFromStorage<Transaction[]>('transactions', []));
    setCategories(getFromStorage<string[]>('categories', []));
    setCostCenters(getFromStorage<CostCenter[]>('costCenters', []));
    setSuppliers(getFromStorage<Supplier[]>('suppliers', []));
    setAlertSettings(getFromStorage<AlertSetting[]>('alertSettings', []));
    setSectorEmailConfig(getFromStorage<SectorEmailConfig>('sectorEmailConfig', {}));
  }, []);

  useEffect(() => {
    // Load from storage only once on initial load
    loadStateFromStorage();
    setIsLoaded(true);
    
    // Add event listener for storage changes from other tabs
    const handleStorageChange = (event: StorageEvent) => {
      // Check if the change is relevant to this app's data
      const appKeys = ['materials', 'transactions', 'categories', 'costCenters', 'suppliers', 'alertSettings', 'sectorEmailConfig'];
      if (event.key && appKeys.includes(event.key)) {
         console.log(`Storage changed in another tab for key: ${event.key}. Reloading state.`);
         loadStateFromStorage();
      }
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

  const addMaterial = useCallback((material: MaterialSave): { id: string, newMaterial: Material } | null => {
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

    let newOrUpdatedMaterial: Material;
    if (existingDeletedIndex !== -1) {
      newOrUpdatedMaterial = {
          ...materials[existingDeletedIndex],
          ...material,
          name: materialNameUpper,
          supplier: material.supplier?.toUpperCase(),
          deleted: false
      };
      setMaterials(prev => {
        const newMaterials = [...prev];
        newMaterials[existingDeletedIndex] = newOrUpdatedMaterial;
        return newMaterials;
      });
      toast({
        title: 'Material Reativado',
        description: `O material "${material.name}" foi reativado com o código existente.`,
      });
    } else {
      newOrUpdatedMaterial = {
        ...material,
        name: materialNameUpper,
        supplier: material.supplier?.toUpperCase(),
        id: generateId('PRD'),
        currentStock: 0,
        deleted: false,
      };
      setMaterials(prev => [newOrUpdatedMaterial, ...prev]);
    }

    if (!categories.includes(material.category)) {
      addCategory(material.category);
    }
    return { id: newOrUpdatedMaterial.id, newMaterial: newOrUpdatedMaterial };
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
  
  const addTransaction = useCallback((transactionData: TransactionSave, type: 'entrada' | 'saida') => {
    let materialId = transactionData.materialId;
    let materialName = transactionData.materialName;

    // Handle new material creation on entry
    if (type === 'entrada' && !materialId && transactionData.materialName && transactionData.unit && transactionData.category) {
        const result = addMaterial({
            name: transactionData.materialName,
            category: transactionData.category,
            unit: transactionData.unit,
            minStock: 0, 
            supplier: transactionData.supplier,
        });

        if (result) {
            materialId = result.id;
            materialName = transactionData.materialName;
        } else {
            return false; // Stop if material creation failed
        }
    }

    if (!materialId) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Material não especificado.' });
      return false;
    }

    const materialIndex = materials.findIndex(m => m.id === materialId);
    if (materialIndex === -1) {
      toast({ variant: 'destructive', title: 'Erro', description: `Material com ID ${materialId} não encontrado.` });
      return false;
    }
    
    const material = materials[materialIndex];
    let newStock = material.currentStock;

    if (type === 'entrada') {
      newStock += transactionData.quantity;
    } else { // 'saida'
      if (material.currentStock < transactionData.quantity) {
        toast({ variant: 'destructive', title: 'Estoque Insuficiente', description: `Não há estoque suficiente de "${material.name}" para esta saída.` });
        return false;
      }
      newStock -= transactionData.quantity;
    }

    const newTransaction: Transaction = {
      ...transactionData,
      id: generateId('TRN'),
      type: type,
      date: transactionData.date.getTime(),
      materialId: material.id,
      materialName: materialName || transactionData.materialName || 'Nome não encontrado',
      invoiceName: transactionData.invoiceName,
    };

    const updatedMaterial = { ...material, currentStock: newStock };
    setMaterials(prev => {
        const newMaterials = [...prev];
        newMaterials[materialIndex] = updatedMaterial;
        return newMaterials;
    });

    setTransactions(prev => [newTransaction, ...prev]);

    if(type === 'saida') {
        checkAndSendAlert(updatedMaterial);
    }
    
    return true;
  }, [materials, toast, addMaterial, checkAndSendAlert]);


  const addMultipleTransactions = useCallback((items: MultiTransactionItemSave[], commonData: Omit<TransactionSave, 'materialId' | 'quantity'>) => {
    let allSucceeded = true;
    let successfulCount = 0;
    
    const newTransactions: Transaction[] = [];
    const updatedMaterials = [...materials];
    const materialsToAlert: Material[] = [];

    for (const item of items) {
        const materialIndex = updatedMaterials.findIndex(m => m.id === item.materialId);
        if (materialIndex === -1) {
            toast({ variant: 'destructive', title: 'Erro', description: `Material com ID ${item.materialId} não encontrado.` });
            allSucceeded = false;
            continue;
        }

        const currentMaterial = updatedMaterials[materialIndex];
        const newStock = currentMaterial.currentStock - item.quantity;

        if (newStock < 0) {
            toast({
                variant: 'destructive',
                title: 'Estoque Insuficiente',
                description: `Não há estoque suficiente de "${currentMaterial.name}" para esta saída.`,
            });
            allSucceeded = false;
            continue; 
        }

        const updatedMaterial = { ...currentMaterial, currentStock: newStock };
        updatedMaterials[materialIndex] = updatedMaterial;
        materialsToAlert.push(updatedMaterial);

        const newTransaction: Transaction = {
            id: generateId('TRN'),
            type: 'saida',
            date: commonData.date.getTime(),
            materialId: item.materialId,
            materialName: currentMaterial.name,
            quantity: item.quantity,
            responsible: commonData.responsible,
            osNumber: commonData.osNumber,
            costCenter: commonData.costCenter,
            stockLocation: commonData.stockLocation?.toUpperCase(),
        };
        newTransactions.push(newTransaction);
        successfulCount++;
    }

    if (newTransactions.length > 0) {
        setMaterials(updatedMaterials);
        setTransactions(prev => [...newTransactions, ...prev]);
        toast({
            title: 'Transações Registradas',
            description: `${successfulCount} retiradas foram salvas com sucesso.`,
        });
        materialsToAlert.forEach(checkAndSendAlert);
    }
    
    return allSucceeded;
  }, [materials, toast, checkAndSendAlert]);
  
 const addMultipleEntries = useCallback((items: EntryItem[], commonData: Omit<TransactionSave, 'materialId' | 'quantity' | 'materialName' | 'unit' | 'category'>) => {
    let allSucceeded = true;
    let successfulCount = 0;
    let newMaterialCount = 0;

    let updatedMaterialsList = [...materials];
    const newTransactions: Transaction[] = [];
    const newCategories = new Set(categories);
    const materialsToAdd: { newMaterial: Material, entryItem: EntryItem }[] = [];
    
    // First pass: validate and prepare new materials without modifying state
    for (const item of items) {
      if (item.isNew) {
        const materialNameUpper = item.materialName.toUpperCase();
        if (updatedMaterialsList.some(m => !m.deleted && m.name.toUpperCase() === materialNameUpper)) {
          toast({
            variant: 'destructive',
            title: 'Material Duplicado',
            description: `Um novo material com o nome "${item.materialName}" não pode ser criado pois ele já existe.`,
          });
          allSucceeded = false;
          continue;
        }
        
        const newMaterial: Material = {
          name: materialNameUpper,
          category: item.category || 'GERAL',
          unit: item.unit || 'un',
          minStock: 0,
          supplier: commonData.supplier,
          id: generateId('PRD'),
          currentStock: 0,
          deleted: false,
        };
        
        materialsToAdd.push({ newMaterial, entryItem: item });
        newMaterialCount++;
      }
    }
    
    if (!allSucceeded) return false;

    // If all validations pass, update the materials list with the new ones
    if (materialsToAdd.length > 0) {
        const newMaterialObjects = materialsToAdd.map(m => m.newMaterial);
        updatedMaterialsList = [...newMaterialObjects, ...updatedMaterialsList];
        newMaterialObjects.forEach(m => newCategories.add(m.category));
    }

    // Second pass: Process all items (new and existing) to create transactions
    for (const item of items) {
        let materialToUpdate: Material | undefined;
        let currentMaterialId: string | undefined = item.materialId;

        if (item.isNew) {
            // Find the newly created material from our temporary list
            const added = materialsToAdd.find(m => m.entryItem === item);
            materialToUpdate = added?.newMaterial;
            currentMaterialId = added?.newMaterial.id;
        } else {
            materialToUpdate = updatedMaterialsList.find(m => m.id === currentMaterialId);
        }
        
        if (!materialToUpdate || !currentMaterialId) {
            console.error(`Critical error: Material not found for item: ${item.materialName}`);
            allSucceeded = false;
            continue;
        }

        const materialIndex = updatedMaterialsList.findIndex(m => m.id === currentMaterialId);
        const newStock = materialToUpdate.currentStock + item.quantity;
        updatedMaterialsList[materialIndex] = { ...materialToUpdate, currentStock: newStock };
        
        const newTransaction: Transaction = {
            id: generateId('TRN'),
            type: 'entrada',
            date: commonData.date.getTime(),
            materialId: currentMaterialId,
            materialName: materialToUpdate.name,
            invoiceName: item.invoiceName || materialToUpdate.name,
            quantity: item.quantity,
            responsible: commonData.responsible,
            supplier: commonData.supplier?.toUpperCase(),
            invoice: commonData.invoice,
            costCenter: commonData.costCenter,
            stockLocation: commonData.stockLocation?.toUpperCase(),
        };
        newTransactions.push(newTransaction);
        successfulCount++;
    }

    // Final state update
    if (successfulCount > 0) {
        setMaterials(updatedMaterialsList);
        setTransactions(prev => [...newTransactions, ...prev]);
        if(newCategories.size > categories.length) {
            setCategories(Array.from(newCategories).sort());
        }
        toast({
            title: 'Entrada Registrada',
            description: `${successfulCount} itens foram adicionados ao estoque. ${newMaterialCount > 0 ? `${newMaterialCount} novos materiais foram criados.` : ''}`,
        });
    }

    return allSucceeded;
}, [materials, categories, toast]);


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

  const addMultipleSuppliers = useCallback((newSuppliers: Omit<Supplier, 'id'>[]) => {
    const messages: { variant: "default" | "destructive", title: string, description: string }[] = [];
    let addedCount = 0;

    setSuppliers(prevSuppliers => {
        const updatedSuppliers = [...prevSuppliers];
        
        newSuppliers.forEach(supplier => {
            const nameUpper = supplier.name.toUpperCase();
            const existing = updatedSuppliers.some(s => s.name.toUpperCase() === nameUpper || (supplier.cnpj && s.cnpj === supplier.cnpj));

            if (!existing) {
                updatedSuppliers.unshift({
                    ...supplier,
                    id: generateId('SUP'),
                    name: nameUpper,
                });
                addedCount++;
            }
        });

        return updatedSuppliers;
    });

    const skippedCount = newSuppliers.length - addedCount;

    if (addedCount > 0) {
        messages.push({
            variant: "default",
            title: 'Importação Concluída',
            description: `${addedCount} fornecedores foram importados com sucesso.`,
        });
    }
    if (skippedCount > 0) {
        messages.push({
            variant: "default",
            title: 'Fornecedores Ignorados',
            description: `${skippedCount} fornecedores foram ignorados pois já existiam (mesmo nome ou CNPJ).`,
        });
    }

    return { messages };
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
    addMultipleEntries,
    addMultipleTransactions,
    addCostCenter,
    updateCostCenter,
    deleteCostCenter,
    getStockByLocation,
    addSupplier,
    addMultipleSuppliers,
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
