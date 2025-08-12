
"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TransactionForm, type TransactionFormValues } from './components/transaction-form';
import { TransactionsTable } from './components/transactions-table';
import { useAppContext } from '@/context/AppContext';
import { PdfImporter } from './components/pdf-importer';

function TransactionsPageContent() {
  const { materials, transactions, addTransaction, costCenters } = useAppContext();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'entrada' ? 'entrada' : 'saida';
  const materialId = searchParams.get('materialId');

  const [activeTab, setActiveTab] = useState(initialTab);
  const [formValues, setFormValues] = useState<Partial<TransactionFormValues>>({});

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl === 'entrada' || tabFromUrl === 'saida') {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handlePdfDataExtracted = (data: Partial<TransactionFormValues>) => {
    setFormValues(data);
    setActiveTab('entrada'); // Switch to input tab when data is extracted
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transações</h1>
        <p className="text-muted-foreground">
          Registre novas entradas e saídas e visualize o histórico.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
           <Tabs value={activeTab} onValueChange={setActiveTab}>
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
                key={`entrada-${JSON.stringify(formValues)}`} // Re-render form when values change
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
      
      <div>
        <TransactionsTable data={transactions} materials={materials} />
      </div>

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
