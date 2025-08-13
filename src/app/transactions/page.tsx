
"use client";

import { Suspense, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';
import { TransactionTypeDialog } from './components/transaction-type-dialog';
import { PlusCircle } from 'lucide-react';
import { PdfImporter } from './components/pdf-importer';
import { TransactionForm, type TransactionFormValues } from './components/transaction-form';
import { TransactionsTable } from './components/transactions-table';


function TransactionsPageContent() {
  const { materials, transactions, addTransaction, costCenters } = useAppContext();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const transactionType = searchParams.get('tab') === 'saida' ? 'saida' : 'entrada';
  const showForm = searchParams.has('showForm');
  const materialId = searchParams.get('materialId');

  const [formValues, setFormValues] = useState<Partial<TransactionFormValues>>({});

  const handlePdfDataExtracted = (data: Partial<TransactionFormValues>) => {
    setFormValues(data);
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set('tab', 'entrada');
    current.set('showForm', 'true');
    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.push(`${pathname}${query}`);
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
                  onSave={addTransaction} 
                  defaultMaterialId={materialId}
                  key={`entrada-${JSON.stringify(formValues)}`}
                  initialValues={formValues} 
                />
             ) : (
                <TransactionForm 
                  type="saida" 
                  materials={materials} 
                  costCenters={costCenters}
                  onSave={addTransaction} 
                  defaultMaterialId={materialId} 
                  key={`saida-${materialId}`}
                />
             )}
          </div>
          <div className="lg:col-span-1">
            <PdfImporter onDataExtracted={handlePdfDataExtracted} />
          </div>
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
