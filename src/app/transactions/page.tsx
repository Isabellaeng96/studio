

"use client";

import { Suspense, useState, useCallback, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';
import { TransactionTypeDialog } from './components/transaction-type-dialog';
import { PlusCircle } from 'lucide-react';
import { PdfImporter } from './components/pdf-importer';
import { MultiItemEntryForm } from './components/multi-item-entry-form';
import { MultiItemTransactionForm } from './components/multi-item-transaction-form';
import { TransactionsTable } from './components/transactions-table';
import { useToast } from '@/hooks/use-toast';
import type { TransactionSave, MultiTransactionItemSave, EntryItem } from '@/types';
import type { TransactionExtractionOutput } from '@/ai/flows/extract-transaction-from-pdf';


function TransactionsPageContent() {
  const { activeMaterials, materials, transactions, addMultipleEntries, addMultipleTransactions, costCenters, categories } = useAppContext();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const getTab = () => searchParams.get('tab') === 'saida' ? 'saida' : 'entrada';
  const getShowForm = () => searchParams.has('showForm');
  const getMaterialId = () => searchParams.get('materialId');

  const [transactionType, setTransactionType] = useState(getTab());
  const [showForm, setShowForm] = useState(getShowForm());
  const [materialId, setMaterialId] = useState(getMaterialId());
  const [initialEntryItems, setInitialEntryItems] = useState<EntryItem[]>([]);
  const [initialInvoice, setInitialInvoice] = useState<string | undefined>();
  const [initialSupplier, setInitialSupplier] = useState<string | undefined>();
  
  useEffect(() => {
    const shouldShowForm = getShowForm();
    if (showForm && !shouldShowForm) {
       resetInitialState();
    }
    setShowForm(shouldShowForm);
    setTransactionType(getTab());
    setMaterialId(getMaterialId());
  }, [searchParams, showForm]);

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
            isNew: !existingMaterial,
            quantity: item.quantity || 0,
            unit: existingMaterial?.unit || item.unit || 'un',
            category: existingMaterial?.category || item.category || 'GERAL'
        };
    });
    
    setInitialEntryItems(extractedItems);
    setInitialInvoice(data.invoice);
    setInitialSupplier(data.supplier);

    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', 'entrada');
    params.set('showForm', 'true');
    router.push(`${pathname}?${params.toString()}`);

  }, [toast, router, pathname, searchParams, activeMaterials]);

  const handleSaveMultiTransaction = (data: { items: MultiTransactionItemSave[] } & Omit<TransactionSave, 'materialId' | 'quantity'>) => {
    return addMultipleTransactions(data.items, data);
  };

  const handleSaveMultiEntry = (data: { items: EntryItem[] } & Omit<TransactionSave, 'materialId' | 'quantity' | 'materialName' | 'unit' | 'category'>) => {
     return addMultipleEntries(data.items, data);
  };

  const resetInitialState = useCallback(() => {
    setInitialEntryItems([]);
    setInitialInvoice(undefined);
    setInitialSupplier(undefined);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('showForm');
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, pathname, router]);

  const handleNewTransactionClick = () => {
    setInitialEntryItems([]);
    setInitialInvoice(undefined);
    setInitialSupplier(undefined);
  };


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
                  key={`saida-${materialId}`}
                />
             )}
          </div>
            {transactionType === 'entrada' && (
              <div className="lg:col-span-1">
                <PdfImporter onDataExtracted={handlePdfDataExtracted} />
              </div>
            )}
        </div>
      ) : (
         <div>
          <TransactionsTable data={transactions} materials={materials} />
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
