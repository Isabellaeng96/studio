
"use client";

import { Suspense, useState, useCallback } from 'react';
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


type ExtractedData = Partial<TransactionFormValues & { unit?: string; category?: string }>;

function TransactionsPageContent() {
  const { materials, transactions, addTransaction, addMaterial, costCenters } = useAppContext();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const transactionType = searchParams.get('tab') === 'saida' ? 'saida' : 'entrada';
  const showForm = searchParams.has('showForm');
  const materialId = searchParams.get('materialId');

  const [formValues, setFormValues] = useState<ExtractedData>({});
  
  const handleSaveTransaction = (transaction: TransactionSave, type: 'entrada' | 'saida') => {
    const wasSaved = addTransaction(transaction, type);
    
    // After saving, redirect to the transactions list only if successful
    if (wasSaved) {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      current.delete('showForm');
      current.delete('materialId');
      const search = current.toString();
      const query = search ? `?${search}` : '';
      router.push(`${pathname}${query}`);
    }
  };

  const handlePdfDataExtracted = useCallback((data: ExtractedData) => {
    let materialForTransaction = materials.find(m => m.name === data.materialName);

    // If material doesn't exist, create it
    if (!materialForTransaction && data.materialName) {
      const wasSaved = addMaterial({
        name: data.materialName,
        category: data.category || 'GERAL',
        unit: data.unit || 'un',
        minStock: 0,
        supplier: data.supplier,
      });

      if (wasSaved) {
         toast({
          title: "Novo Material Cadastrado!",
          description: `O material "${data.materialName}" foi criado.`,
        });
      } else {
         return;
      }
    }

    const updatedData = { ...data };
    
    setFormValues(updatedData);

    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set('tab', 'entrada');
    current.set('showForm', 'true');
    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.push(`${pathname}${query}`);
  }, [materials, addMaterial, router, pathname, searchParams, toast]);


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
                  materials={materials} 
                  costCenters={costCenters}
                  onSave={handleSaveTransaction} 
                  defaultMaterialId={materialId}
                  key={`entrada-${JSON.stringify(formValues)}`}
                  initialValues={formValues} 
                />
             ) : (
                <TransactionForm 
                  type="saida" 
                  materials={materials} 
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
