

"use client";

import { Suspense, useState, useCallback, useEffect, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';
import { TransactionTypeDialog } from './components/transaction-type-dialog';
import { PlusCircle, Search, SlidersHorizontal, QrCode } from 'lucide-react';
import { PdfImporter } from './components/pdf-importer';
import { MultiItemEntryForm } from './components/multi-item-entry-form';
import { MultiItemTransactionForm } from './components/multi-item-transaction-form';
import { TransactionsTable } from './components/transactions-table';
import { useToast } from '@/hooks/use-toast';
import type { TransactionSave, MultiTransactionItemSave, EntryItem, Supplier } from '@/types';
import type { TransactionExtractionOutput } from '@/ai/flows/extract-transaction-from-pdf';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TransactionExporter } from './components/transaction-exporter';
import { useAuth } from '@/context/AuthContext';
import { WithdrawalImporter } from './components/withdrawal-importer';
import { QrCodeScanner } from './components/qr-code-scanner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';


function TransactionsPageContent() {
  const { activeMaterials, materials, transactions, addMultipleEntries, addMultipleTransactions, costCenters, categories } = useAppContext();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const { user } = useAuth();

  const getTab = useCallback(() => searchParams.get('tab') === 'saida' ? 'saida' : 'entrada', [searchParams]);
  const getShowForm = useCallback(() => searchParams.has('showForm'), [searchParams]);
  const getMaterialId = useCallback(() => searchParams.get('materialId'), [searchParams]);

  // Filter states
  const typeFilter = searchParams.get('type') || 'all';
  const materialFilter = searchParams.get('material') || 'all';
  const costCenterFilter = searchParams.get('costCenter') || 'all';
  const [documentQuery, setDocumentQuery] = useState('');

  const [transactionType, setTransactionType] = useState(getTab());
  const [showForm, setShowForm] = useState(getShowForm());
  const [materialId, setMaterialId] = useState(getMaterialId());
  
  // State for form initial data
  const [initialEntryItems, setInitialEntryItems] = useState<EntryItem[]>([]);
  const [initialWithdrawalItems, setInitialWithdrawalItems] = useState<MultiTransactionItemSave[]>([]);
  const [initialInvoice, setInitialInvoice] = useState<string | undefined>();
  const [initialSupplier, setInitialSupplier] = useState<Omit<Supplier, 'id'>>();
  
  const resetInitialState = useCallback(() => {
    setInitialEntryItems([]);
    setInitialWithdrawalItems([]);
    setInitialInvoice(undefined);
    setInitialSupplier(undefined);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('showForm');
    if(params.has('materialId')) params.delete('materialId');
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, pathname, router]);

  useEffect(() => {
    const newShowForm = getShowForm();
    if (showForm && !newShowForm) {
        resetInitialState();
    }
    setShowForm(newShowForm);
    setTransactionType(getTab());

    const newMaterialId = getMaterialId();
    setMaterialId(newMaterialId);
    if (newMaterialId) {
        // If there's a materialId in the URL, initialize the withdrawal items with it.
        // This ensures scanning or clicking a material works as expected.
        setInitialWithdrawalItems([{ materialId: newMaterialId, quantity: 1 }]);
    } else if (!newShowForm) {
        // Clear items only if the form is being hidden and no material is selected
        setInitialWithdrawalItems([]);
    }

  }, [searchParams, showForm, getTab, getShowForm, getMaterialId, resetInitialState]);


  const handlePdfDataExtracted = useCallback((data: TransactionExtractionOutput) => {
    if (!data.materials || data.materials.length === 0) {
      toast({
        variant: "destructive",
        title: "Nenhum material encontrado",
        description: "A IA não conseguiu extrair itens do PDF. Verifique o documento.",
      });
      return;
    }
    
    const extractedItems: EntryItem[] = data.materials.map(item => {
        const existingMaterial = activeMaterials.find(m => m.name.toUpperCase() === item.materialName?.toUpperCase());
        return {
            materialId: existingMaterial?.id,
            materialName: existingMaterial ? existingMaterial.name : (item.materialName || ''),
            invoiceName: item.materialName || '', // Keep original name from PDF
            isNew: !existingMaterial,
            quantity: item.quantity || 0,
            unitPrice: item.unitPrice || 0,
            unit: existingMaterial?.unit || item.unit || 'un',
            category: existingMaterial?.category || item.category || 'GERAL'
        };
    });
    
    setInitialEntryItems(extractedItems);
    setInitialInvoice(data.invoice);
    if (data.supplier) {
        setInitialSupplier(data.supplier);
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', 'entrada');
    params.set('showForm', 'true');
    router.push(`${pathname}?${params.toString()}`);

  }, [toast, router, pathname, searchParams, activeMaterials]);
  
  const handleCsvDataExtracted = useCallback((data: MultiTransactionItemSave[]) => {
    setInitialWithdrawalItems(data);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', 'saida');
    params.set('showForm', 'true');
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams]);

  const handleSaveMultiTransaction = (data: { items: MultiTransactionItemSave[] } & Omit<TransactionSave, 'materialId' | 'quantity'>) => {
    return addMultipleTransactions(data.items, data);
  };

  const handleSaveMultiEntry = (data: { items: EntryItem[] } & Omit<TransactionSave, 'materialId' | 'quantity' | 'materialName' | 'unit' | 'category' | 'supplier'> & { supplier?: Omit<Supplier, 'id'> }) => {
     return addMultipleEntries(data.items, data);
  };

  const handleNewTransactionClick = () => {
    setInitialEntryItems([]);
    setInitialWithdrawalItems([]);
    setInitialInvoice(undefined);
    setInitialSupplier(undefined);
  };
  
  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);
  
  const filteredTransactions = useMemo(() => {
    return sortedTransactions.filter(tx => {
      const typeMatch = typeFilter === 'all' || tx.type === typeFilter;
      const materialMatch = materialFilter === 'all' || tx.materialId === materialFilter;
      const costCenterMatch = costCenterFilter === 'all' || tx.costCenter === costCenterFilter;
      
      const lowercasedQuery = documentQuery.toLowerCase();
      const documentMatch = !documentQuery ||
        (tx.invoice && tx.invoice.toLowerCase().includes(lowercasedQuery)) ||
        (tx.osNumber && tx.osNumber.toLowerCase().includes(lowercasedQuery));
        
      return typeMatch && materialMatch && costCenterMatch && documentMatch;
    });
  }, [sortedTransactions, typeFilter, materialFilter, costCenterFilter, documentQuery]);

  const handleQrScan = useCallback((scannedMaterialId: string) => {
    setInitialWithdrawalItems(currentItems => {
        const newItems = [...currentItems];
        const existingItemIndex = newItems.findIndex(item => item.materialId === scannedMaterialId);

        if (existingItemIndex > -1) {
            newItems[existingItemIndex] = {
                ...newItems[existingItemIndex],
                quantity: newItems[existingItemIndex].quantity + 1,
            };
        } else {
            newItems.push({ materialId: scannedMaterialId, quantity: 1 });
        }
        return newItems;
    });

    // Ensure the form is shown
    if (!showForm) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', 'saida');
      params.set('showForm', 'true');
      router.push(`${pathname}?${params.toString()}`);
    }
  }, [showForm, router, pathname, searchParams]);


  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transações</h1>
          <p className="text-muted-foreground">
            Registre novas entradas e saídas e visualize o histórico.
          </p>
        </div>
        <div className="flex items-center gap-2">
           <TransactionTypeDialog onOpen={handleNewTransactionClick}>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nova Transação
              </Button>
            </TransactionTypeDialog>
        </div>
      </div>

      {showForm ? (
         <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
             {transactionType === 'entrada' ? (
                <MultiItemEntryForm
                    materials={activeMaterials}
                    categories={categories}
                    onSave={handleSaveMultiEntry}
                    onCancel={resetInitialState}
                    key={`entrada-${JSON.stringify(initialEntryItems)}`}
                    initialItems={initialEntryItems}
                    initialInvoice={initialInvoice}
                    initialSupplier={initialSupplier}
                />
             ) : (
                <MultiItemTransactionForm
                  materials={activeMaterials} 
                  costCenters={costCenters}
                  onSave={handleSaveMultiTransaction}
                  defaultMaterialId={materialId}
                  initialItems={initialWithdrawalItems}
                  key={`saida-${materialId}-${JSON.stringify(initialWithdrawalItems)}`}
                />
             )}
          </div>
            <div className="lg:col-span-1 space-y-8">
                {transactionType === 'entrada' ? (
                    <PdfImporter onDataExtracted={handlePdfDataExtracted} />
                ) : (
                    <>
                      <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <QrCode className="h-5 w-5 text-primary"/>
                                Leitor de QR Code
                            </CardTitle>
                            <CardDescription>
                                Use a câmera para adicionar materiais à lista de retirada rapidamente.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                           <QrCodeScanner onScan={handleQrScan} materials={materials} />
                        </CardContent>
                      </Card>
                      <WithdrawalImporter onDataExtracted={handleCsvDataExtracted} materials={materials} />
                    </>
                )}
            </div>
        </div>
      ) : (
         <div className="space-y-6">
            <div className="space-y-4 rounded-md border p-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                    <SlidersHorizontal className="h-5 w-5" />
                    Filtros de Transação
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div className="relative md:col-span-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por OS ou NF..."
                            className="w-full pl-9"
                            value={documentQuery}
                            onChange={(e) => setDocumentQuery(e.target.value)}
                        />
                    </div>
                     <Select value={typeFilter} onValueChange={(v) => handleFilterChange('type', v)}>
                        <SelectTrigger><SelectValue placeholder="Filtrar por tipo" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os Tipos</SelectItem>
                            <SelectItem value="entrada">Entrada</SelectItem>
                            <SelectItem value="saida">Saída</SelectItem>
                        </SelectContent>
                    </Select>
                     <Select value={materialFilter} onValueChange={(v) => handleFilterChange('material', v)}>
                        <SelectTrigger><SelectValue placeholder="Filtrar por material" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os Materiais</SelectItem>
                            {activeMaterials.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={costCenterFilter} onValueChange={(v) => handleFilterChange('costCenter', v)}>
                        <SelectTrigger><SelectValue placeholder="Filtrar por C. Custo" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os C. de Custo</SelectItem>
                            {costCenters.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
             <div className="flex justify-end">
                <TransactionExporter transactions={filteredTransactions} materials={materials} user={user} />
             </div>
            <TransactionsTable data={filteredTransactions} materials={materials} />
        </div>
      )}
    </div>
  );
}


export default function TransactionsPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <TransactionsPageContent />
    </Suspense>
  )
}
