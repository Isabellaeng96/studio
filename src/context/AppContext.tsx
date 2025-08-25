
"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import type { Material, Transaction, TransactionSave, MaterialSave, CostCenter, Supplier, AlertSetting, SectorEmailConfig, MultiTransactionItemSave, EntryItem, AppUser, AppUserSave } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';

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
  users: AppUser[];
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
  addUser: (user: AppUserSave) => void;
  updateUser: (user: AppUser) => void;
  deleteUser: (userId: string) => void;
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
  const [materials, setMaterials] = useState<Material[]>(() => getFromStorage<Material[]>('materials', [
    { id: 'mat-007', name: 'CABO PP 3X1.5MM²', unit: 'm', category: 'Elétrica', minStock: 100, currentStock: 95, supplier: 'PRYSMIAN', deleted: false, lastPaidPrice: 5.50 },
  ]));
  const [transactions, setTransactions] = useState<Transaction[]>(() => getFromStorage<Transaction[]>('transactions', [
      { id: 'trn-007', type: 'saida', date: new Date().getTime(), materialId: 'mat-007', materialName: 'CABO PP 3X1.5MM²', quantity: 10, responsible: 'Sistema', osNumber: 'OS-TESTE', costCenter: 'Manutenção Preventiva' },
      { id: 'trn-008', type: 'entrada', date: new Date('2024-07-25T10:00:00Z').getTime(), materialId: 'mat-007', materialName: 'CABO PP 3X1.5MM²', quantity: 105, unitPrice: 5.50, responsible: 'Admin', invoice: 'NF-TESTE' },
  ]));
  const [categories, setCategories] = useState<string[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [users, setUsers] = useState<AppUser[]>(() => getFromStorage<AppUser[]>('users', []));
  const [alertSettings, setAlertSettings] = useState<AlertSetting[]>(() => getFromStorage<AlertSetting[]>('alertSettings', [
    { materialId: 'mat-007', sectors: ['Compras'] }
  ]));
  const [sectorEmailConfig, setSectorEmailConfig] = useState<SectorEmailConfig>(() => getFromStorage<SectorEmailConfig>('sectorEmailConfig', {
    'Compras': ['compras@geoblue.com.br']
  }));

  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  const availableSectors = useMemo(() => ['Engenharia', 'Manutenção', 'Compras', 'Logística', 'Diretoria'], []);
  
  const loadStateFromStorage = useCallback(() => {
    // This now primarily sets the initial state, but getFromStorage will still be used
    // in the useState initializers for a first-load scenario.
    // Subsequent loads and tab syncs are handled here.
    const storedMaterials = getFromStorage<Material[]>('materials', []);
    if (storedMaterials.length > 0) setMaterials(storedMaterials);
    
    const storedTransactions = getFromStorage<Transaction[]>('transactions', []);
    if (storedTransactions.length > 0) setTransactions(storedTransactions);
    
    setCategories(getFromStorage<string[]>('categories', []));
    setCostCenters(getFromStorage<CostCenter[]>('costCenters', []));
    setSuppliers(getFromStorage<Supplier[]>('suppliers', []));
    
    const storedUsers = getFromStorage<AppUser[]>('users', []);
     if (storedUsers.length > 0) {
        setUsers(storedUsers);
    } else {
        // If nothing in storage, ensure the default admin is set.
         setUsers([
            { id: 'USR-001', name: 'Admin Geoblue', email: 'tec08@geoblue.com.br', role: 'Administrador', sector: 'Manutenção' },
            { id: 'USR-002', name: 'Gerente Compras', email: 'gerente@geoblue.com.br', role: 'Gerente de Estoque', sector: 'Logística' },
            { id: 'USR-003', name: 'Admin Padrão', email: 'admin@geoblue.com.br', role: 'Administrador', sector: 'Diretoria' },
        ]);
    }
    
    const storedAlertSettings = getFromStorage<AlertSetting[]>('alertSettings', []);
    if (storedAlertSettings.length > 0) setAlertSettings(storedAlertSettings);

    const storedSectorEmails = getFromStorage<SectorEmailConfig>('sectorEmailConfig', {});
    if(Object.keys(storedSectorEmails).length > 0) setSectorEmailConfig(storedSectorEmails);
    
  }, []);

  useEffect(() => {
    // Load from storage only once on initial load
    if(!isLoaded) {
      loadStateFromStorage();
      setIsLoaded(true);
    }
    
    // Add event listener for storage changes from other tabs
    const handleStorageChange = (event: StorageEvent) => {
      const appKeys = ['materials', 'transactions', 'categories', 'costCenters', 'suppliers', 'users', 'alertSettings', 'sectorEmailConfig'];
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

  }, [isLoaded, loadStateFromStorage]);


  useEffect(() => { if (isLoaded) setInStorage('materials', materials); }, [materials, isLoaded]);
  useEffect(() => { if (isLoaded) setInStorage('transactions', transactions); }, [transactions, isLoaded]);
  useEffect(() => { if (isLoaded) setInStorage('categories', categories); }, [categories, isLoaded]);
  useEffect(() => { if (isLoaded) setInStorage('costCenters', costCenters); }, [costCenters, isLoaded]);
  useEffect(() => { if (isLoaded) setInStorage('suppliers', suppliers); }, [suppliers, isLoaded]);
  useEffect(() => { if (isLoaded) setInStorage('users', users); }, [users, isLoaded]);
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
    return newOrUpdatedMaterial.id;
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

  const checkAndSendAlert = useCallback(async (material: Material) => {
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
         try {
           const mailRef = collection(db, "mail");
           await addDoc(mailRef, {
             to: Array.from(recipientEmails),
             message: {
               subject: `Alerta de Estoque Baixo - ${material.name}`,
               html: `
                <h1>Alerta de Estoque Baixo</h1>
                <p>O material "${material.name}" (Código: ${material.id}) atingiu um nível de estoque baixo.</p>
                <ul>
                  <li><strong>Estoque Atual:</strong> ${material.currentStock} ${material.unit}</li>
                  <li><strong>Estoque Mínimo:</strong> ${material.minStock} ${material.unit}</li>
                </ul>
                <p>Por favor, tome as medidas necessárias para a reposição.</p>
               `,
             }
           });
           toast({
             title: `Alerta de Estoque Baixo: ${material.name}`,
             description: `Notificação enviada para: ${setting.sectors.join(', ')}`,
           });
         } catch(error) {
            console.error("Erro ao escrever e-mail no Firestore:", error);
            toast({
              variant: "destructive",
              title: `Falha ao Enviar Alerta: ${material.name}`,
              description: `Não foi possível registrar o e-mail no Firestore. Verifique a configuração.`,
            });
         }
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
            materialId = result;
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

    const updatedMaterial = { 
        ...material, 
        currentStock: newStock,
        lastPaidPrice: type === 'entrada' && transactionData.unitPrice ? transactionData.unitPrice : material.lastPaidPrice,
    };

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
            osNumber: commonData.osNumber?.toUpperCase(),
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

    const materialsToAdd: { newMaterial: Material, entryItem: EntryItem }[] = [];
    const newCategories = new Set(categories);
    let updatedMaterialsList = [...materials]; // Start with the current state

    // First pass: validate and collect new materials
    for (const item of items) {
        if (item.isNew) {
            const materialNameUpper = item.materialName.toUpperCase();
            if (updatedMaterialsList.some(m => !m.deleted && m.name.toUpperCase() === materialNameUpper) || materialsToAdd.some(m => m.newMaterial.name === materialNameUpper)) {
                toast({
                    variant: 'destructive',
                    title: 'Material Duplicado',
                    description: `Um material com o nome "${item.materialName}" já existe ou está duplicado na lista. A entrada não pode ser salva.`,
                });
                return false; // Abort the whole operation
            }
            
            const newMaterial: Material = {
                name: materialNameUpper,
                category: item.category || 'GERAL',
                unit: item.unit || 'un',
                minStock: 0,
                supplier: commonData.supplier?.toUpperCase(),
                id: generateId('PRD'),
                currentStock: 0,
                deleted: false,
                lastPaidPrice: item.unitPrice,
            };
            materialsToAdd.push({ newMaterial, entryItem: item });
            newCategories.add(newMaterial.category);
        }
    }
    
    // Add all new materials to the list at once
    if (materialsToAdd.length > 0) {
        const newMaterialsOnly = materialsToAdd.map(m => m.newMaterial);
        updatedMaterialsList = [...newMaterialsOnly, ...updatedMaterialsList];
        newMaterialCount = newMaterialsOnly.length;
    }

    const newTransactions: Transaction[] = [];

    // Second pass: process all items (new and existing) against the updated list
    for (const item of items) {
        let materialToUpdate: Material | undefined;
        let currentMaterialId: string | undefined;

        if (item.isNew) {
            const added = materialsToAdd.find(m => m.entryItem.materialName.toUpperCase() === item.materialName.toUpperCase());
            materialToUpdate = updatedMaterialsList.find(m => m.id === added?.newMaterial.id);
            currentMaterialId = added?.newMaterial.id;
        } else {
            currentMaterialId = item.materialId;
            materialToUpdate = updatedMaterialsList.find(m => m.id === currentMaterialId);
        }
        
        if (!materialToUpdate || !currentMaterialId) {
            console.error(`Critical error: New material not found immediately after creation. ID: ${currentMaterialId}`);
            allSucceeded = false;
            continue; // Skip this item, but don't abort the whole process
        }
        
        const materialIndex = updatedMaterialsList.findIndex(m => m.id === currentMaterialId);
        const newStock = materialToUpdate.currentStock + item.quantity;
        updatedMaterialsList[materialIndex] = { 
            ...materialToUpdate, 
            currentStock: newStock,
            lastPaidPrice: item.unitPrice,
        };
        
        const newTransaction: Transaction = {
            id: generateId('TRN'),
            type: 'entrada',
            date: commonData.date.getTime(),
            materialId: currentMaterialId,
            materialName: materialToUpdate.name,
            invoiceName: item.invoiceName || materialToUpdate.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            responsible: commonData.responsible,
            supplier: commonData.supplier?.toUpperCase(),
            invoice: commonData.invoice,
            costCenter: commonData.costCenter,
            stockLocation: commonData.stockLocation?.toUpperCase(),
        };
        newTransactions.push(newTransaction);
        successfulCount++;
    }

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
    
    // Sort transactions by date to process them in chronological order
    const materialTransactions = transactions
      .filter(t => t.materialId === materialId)
      .sort((a, b) => a.date - b.date);

    materialTransactions.forEach(t => {
      const location = t.stockLocation || 'Não especificado';
      if (stockMap[location] === undefined) {
        stockMap[location] = 0;
      }
      
      if (t.type === 'entrada') {
        stockMap[location] += t.quantity;
      } else {
        stockMap[location] -= t.quantity;
      }
    });

    // Remove locations where stock is zero or less
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
  
  const addUser = useCallback((user: AppUserSave) => {
    const existing = users.find(u => u.email === user.email);
    if (existing) {
        toast({
            variant: 'destructive',
            title: 'E-mail já cadastrado',
            description: `O e-mail ${user.email} já pertence a um usuário.`
        });
        return;
    }
    const newUser: AppUser = { ...user, id: generateId('USR') };
    setUsers(prev => [newUser, ...prev]);
  }, [users, toast]);
  
  const updateUser = useCallback((user: AppUser) => {
    setUsers(prev => prev.map(u => u.id === user.id ? user : u));
  }, []);
  
  const deleteUser = useCallback((userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  }, []);


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
    addUser,
    updateUser,
    deleteUser,
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

    
