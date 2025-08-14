"use client";

import { PlusCircle, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';
import { SuppliersTable } from './components/suppliers-table';
import { SupplierForm } from './components/supplier-form';
import { SupplierImporter } from './components/supplier-importer';

export default function SuppliersPage() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, addMultipleSuppliers } = useAppContext();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fornecedores</h1>
          <p className="text-muted-foreground">
            Gerencie sua lista de fornecedores.
          </p>
        </div>
        <div className="flex items-center gap-2">
           <SupplierImporter onImport={addMultipleSuppliers}>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Importar
              </Button>
            </SupplierImporter>
          <SupplierForm onSave={addSupplier}>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Fornecedor
            </Button>
          </SupplierForm>
        </div>
      </div>
      <SuppliersTable
        data={suppliers} 
        onSave={updateSupplier} 
        onDelete={deleteSupplier}
      />
    </div>
  );
}
