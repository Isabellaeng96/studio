
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
import type { TransactionExtractionOutput } from '@/ai/flows/extract-transaction-from-pdf';


type ExtractedData = Partial<TransactionFormValues & { unit?: string; category?: string }>;

function TransactionsPageContent() {
  const { activeMaterials, materials, transactions, addTransaction, addMaterial, costCenters } = useAppContext();
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
    if (wasSaved) {
       const current = new URLSearchParams(Array.from(searchParams.entries()));
       current.delete('showForm');
       current.delete('materialId');
       current.delete('tab');
       const search = current.toString();
       const query = search ? `?${search}` : '';
       router.push(`${pathname}${query}`);
       setFormValues({}); // Clear form values after successful save
    }
    return wasSaved;
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
    
    // For now, let's take the first material and pre-fill the form.
    // This links the material creation to the transaction saving.
    const firstMaterial = data.materials[0];

    // Check if the material already exists to pass the ID
    const existingMaterial = activeMaterials.find(m => m.name.toUpperCase() === firstMaterial.materialName?.toUpperCase());

    const valuesToSet: ExtractedData = {
      materialId: existingMaterial?.id,
      materialName: firstMaterial.materialName,
      quantity: firstMaterial.quantity,
      unit: firstMaterial.unit,
      category: firstMaterial.category,
      supplier: data.supplier,
      invoice: data.invoice,
    };
    
    setFormValues(valuesToSet);

    // Navigate to the form view
    const params = new URLSearchParams();
    params.set('tab', 'entrada');
    params.set('showForm', 'true');
    router.push(`${pathname}?${params.toString()}`);

  }, [activeMaterials, router, pathname, toast]);


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
