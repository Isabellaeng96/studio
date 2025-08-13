

export type Material = {
  id: string;
  name: string;
  unit: string;
  category: string;
  minStock: number;
  currentStock: number;
  supplier?: string;
  deleted?: boolean;
};

export type MaterialSave = Omit<Material, 'id' | 'currentStock' | 'deleted'>;

export type Transaction = {
  id: string;
  type: 'entrada' | 'saida';
  date: number; // timestamp
  materialId: string;
  materialName: string;
  quantity: number;
  supplier?: string;
  invoice?: string;
  osNumber?: string;
  workFront?: string;
  responsible: string;
  costCenter?: string;
  stockLocation?: string;
};

export type TransactionSave = Omit<Transaction, 'id' | 'type' | 'date' | 'materialName'> & {
  date: Date;
  materialName?: string;
  // Fields for new material creation
  unit?: string;
  category?: string;
};


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
};
