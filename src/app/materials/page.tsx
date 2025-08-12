"use client";

import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { materials as initialMaterials } from '@/lib/mock-data';
import { MaterialsTable } from './components/materials-table';
import { MaterialForm } from './components/material-form';
import { useState } from 'react';
import { Material } from '@/types';

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);

  const handleSaveMaterial = (material: Omit<Material, 'id' | 'currentStock'> & { id?: string }) => {
    setMaterials(prev => {
      if (material.id) {
        // Update existing material
        return prev.map(m => m.id === material.id ? { ...m, ...material } : m);
      } else {
        // Add new material
        const newMaterial: Material = {
          ...material,
          id: `mat-${Date.now()}`,
          currentStock: 0, // Initial stock for new material
        };
        return [newMaterial, ...prev];
      }
    });
  };

  const handleDeleteMaterial = (materialId: string) => {
    setMaterials(prev => prev.filter(m => m.id !== materialId));
  };


  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Materiais</h1>
          <p className="text-muted-foreground">
            Catálogo de todos os materiais de manutenção.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <MaterialForm onSave={handleSaveMaterial}>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Material
            </Button>
          </MaterialForm>
        </div>
      </div>
      <MaterialsTable data={materials} onSave={handleSaveMaterial} onDelete={handleDeleteMaterial} />
    </div>
  );
}
