






export type Material = {
  id: string;
  name: string;
  unit: string;
  category: string;
  minStock: number;
  currentStock: number;
  supplier?: string;
  deleted?: boolean;
  lastPaidPrice?: number;
};

export type MaterialSave = Omit<Material, 'id' | 'currentStock' | 'deleted' | 'lastPaidPrice'>;

export type Transaction = {
  id: string;
  type: 'entrada' | 'saida';
  date: number; // timestamp
  materialId: string;
  materialName: string;
  quantity: number;
  unitPrice?: number;
  supplier?: string;
  invoice?: string;
  invoiceName?: string; // Nome do item conforme a nota fiscal
  osNumber?: string;
  responsible: string;
  costCenter?: string;
  stockLocation?: string;
  freightCost?: number;
};

export type TransactionSave = Omit<Transaction, 'id' | 'type' | 'date' | 'materialName' | 'invoiceName'> & {
  date: Date;
  materialName?: string;
  invoiceName?: string;
  // Fields for new material creation
  unit?: string;
  category?: string;
};

export type MultiTransactionItemSave = {
  materialId: string;
  quantity: number;
};

export type EntryItem = {
    materialId?: string; // Will be empty for new materials
    materialName: string;
    invoiceName?: string; // Opcional, nome na nota fiscal
    isNew: boolean;
    quantity: number;
    unitPrice: number;
    unit: string;
    category: string;
}


export type StockTurnover = {
  materialId: string;
  materialName: string;
  turnover: number;
};

export type XyzClassification = {
  materialId: string;
  materialName: string;
  classification: 'X' | 'Y' | 'Z';
  description: string;
};

export type CostCenter = {
  id: string;
  name: string;
  description?: string;
};

export type Supplier = {
  id: string;
  name: string;
  cnpj?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  website?: string;
};

export type AppUser = {
    id: string;
    name: string;
    email: string;
    role: 'Administrador' | 'Gerente de Estoque' | 'Operador de Campo' | 'Visitante';
    sector: string;
};

export type AppUserSave = Omit<AppUser, 'id'>;


export type AlertSetting = {
  materialId: string;
  sectors: string[];
};

export type SectorEmailConfig = {
  [sector: string]: string[];
};

export type PurchaseOrderItem = {
  materialId: string;
  quantity: number;
  supplierId: string;
};
    
