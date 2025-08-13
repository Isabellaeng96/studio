
"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TransactionForm, type TransactionFormValues } from './components/transaction-form';
import { TransactionsTable } from './components/transactions-table';
import { useAppContext } from '@/context/AppContext';
import { PdfImporter } from './components/pdf-importer';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { TransactionTypeDialog } from './components/transaction-type-dialog';

function TransactionsPageContent() {
  const { materials, transactions, addTransaction, costCenters } = useAppContext();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const initialTab = searchParams.get('tab') === 'saida' ? 'saida' : 'entrada';
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

  const handleTabChange = (value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set('tab', value);
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
            <Tabs value={initialTab} onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="entrada">Entrada</TabsTrigger>
                <TabsTrigger value="saida">Saída</TabsTrigger>
              </TabsList>
              <TabsContent value="entrada">
                <TransactionForm 
                  type="entrada" 
                  materials={materials} 
                  costCenters={costCenters}
                  onSave={addTransaction} 
                  defaultMaterialId={materialId}
                  key={`entrada-${JSON.stringify(formValues)}`}
                  initialValues={formValues} 
                />
              </TabsContent>
              <TabsContent value="saida">
                <TransactionForm 
                  type="saida" 
                  materials={materials} 
                  costCenters={costCenters}
                  onSave={addTransaction} 
                  defaultMaterialId={materialId} 
                  key={`saida-${materialId}`}
                />
              </TabsContent>
            </Tabs>
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
