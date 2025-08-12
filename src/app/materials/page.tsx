"use client";

import { PlusCircle, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { materials as initialMaterials } from '@/lib/mock-data';
import { MaterialsTable } from './components/materials-table';
import { MaterialForm } from './components/material-form';
import { useState } from 'react';
import { Material } from '@/types';
import { CategoryForm } from './components/category-form';

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);
  const [categories, setCategories] = useState<string[]>(() => {
    const uniqueCategories = new Set(initialMaterials.map(m => m.category));
    return Array.from(uniqueCategories);
  });

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

  const handleAddCategory = (category: string) => {
    setCategories(prev => {
      const newCategories = new Set([...prev, category]);
      return Array.from(newCategories);
    });
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
           <CategoryForm onSave={handleAddCategory}>
             <Button variant="outline">
              <Tag className="mr-2 h-4 w-4" />
              Adicionar Categoria
            </Button>
           </CategoryForm>
          <MaterialForm onSave={handleSaveMaterial} categories={categories}>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Material
            </Button>
          </MaterialForm>
        </div>
      </div>
      <MaterialsTable data={materials} onSave={handleSaveMaterial} onDelete={handleDeleteMaterial} categories={categories} />
    </div>
  );
}