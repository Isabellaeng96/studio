"use client";

import { PlusCircle, Tag, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MaterialsTable } from './components/materials-table';
import { MaterialForm } from './components/material-form';
import { CategoryForm } from './components/category-form';
import { useAppContext } from '@/context/AppContext';
import { MaterialImporter } from './components/material-importer';
import { MaterialExporter } from './components/material-exporter';

export default function MaterialsPage() {
  const { materials, categories, addMaterial, updateMaterial, deleteMaterial, deleteMultipleMaterials, addCategory, addMultipleMaterials } = useAppContext();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Materiais</h1>
          <p className="text-muted-foreground">
            Catálogo de todos os materiais de manutenção.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
           <MaterialExporter materials={materials} />
           <CategoryForm onSave={addCategory}>
             <Button variant="outline">
              <Tag className="mr-2 h-4 w-4" />
              Adicionar Categoria
            </Button>
           </CategoryForm>
            <MaterialImporter onImport={addMultipleMaterials}>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Importar
              </Button>
            </MaterialImporter>
          <MaterialForm onSave={addMaterial} categories={categories}>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Material
            </Button>
          </MaterialForm>
        </div>
      </div>
      <MaterialsTable 
        data={materials} 
        onSave={updateMaterial} 
        onDelete={deleteMaterial}
        onDeleteMultiple={deleteMultipleMaterials}
        categories={categories} 
      />
    </div>
  );
}
