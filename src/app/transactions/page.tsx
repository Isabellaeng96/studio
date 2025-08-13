
"use client";

import { Suspense, useState, useCallback, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';
import { TransactionTypeDialog } from './components/transaction-type-dialog';
import { PlusCircle } from 'lucide-react';
import { PdfImporter } from './components/pdf-importer';
import { TransactionForm, type TransactionFormValues } from './components/transaction-form';
import { TransactionsTable } from './components/transactions-table';
import { useToast } from '@/hooks/use-toast';
import type { TransactionSave } from '@/types';
import type { TransactionExtractionOutput } from '@/ai/flows/extract-transaction-from-pdf';


type ExtractedData = Partial<TransactionFormValues & { unit?: string; category?: string }>;

function TransactionsPageContent() {
  const { activeMaterials, materials, transactions, addTransaction, costCenters } = useAppContext();
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
  const [formValues, setFormValues] = useState<ExtractedData>({});
  
  useEffect(() => {
    setTransactionType(getTab());
    setShowForm(getShowForm());
    setMaterialId(getMaterialId());
  }, [searchParams]);

  const handleSaveTransaction = (transaction: TransactionSave, type: 'entrada' | 'saida') => {
    return addTransaction(transaction, type);
  };
  
  const handlePdfDataExtracted = useCallback((data: TransactionExtractionOutput) => {
    if (!data.materials || data.materials.length === 0) {
      toast({
        variant: "destructive",
        title: "Nenhum material encontrado",
        description: "A IA não conseguiu extrair itens do PDF. Verifique o documento.",
      });
      return;
    }
    
    // Take the first material and pre-fill the form
    const firstItem = data.materials[0];
    const extractedValues: ExtractedData = {
      materialName: firstItem.materialName,
      quantity: firstItem.quantity,
      unit: firstItem.unit,
      category: firstItem.category,
      supplier: data.supplier,
      invoice: data.invoice,
    };
    
    setFormValues(extractedValues);

    // Switch to the form view
    const params = new URLSearchParams();
    params.set('tab', 'entrada');
    params.set('showForm', 'true');
    router.push(`${pathname}?${params.toString()}`);

  }, [toast, router, pathname]);


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
           <TransactionTypeDialog>
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
                 <TransactionForm 
                  type="entrada" 
                  materials={activeMaterials} 
                  costCenters={costCenters}
                  onSave={handleSaveTransaction} 
                  defaultMaterialId={materialId}
                  key={`entrada-${JSON.stringify(formValues)}`}
                  initialValues={formValues} 
                />
             ) : (
                <TransactionForm 
                  type="saida" 
                  materials={activeMaterials} 
                  costCenters={costCenters}
                  onSave={handleSaveTransaction}
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
