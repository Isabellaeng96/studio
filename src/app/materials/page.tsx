
"use client";

import { useMemo, Suspense, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { PlusCircle, Tag, Upload, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MaterialsTable } from './components/materials-table';
import { MaterialForm } from './components/material-form';
import { CategoryForm } from './components/category-form';
import { useAppContext } from '@/context/AppContext';
import { MaterialImporter } from './components/material-importer';
import { MaterialExporter } from './components/material-exporter';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

function MaterialsPageContent() {
  const { materials, categories, addMaterial, updateMaterial, deleteMaterial, deleteMultipleMaterials, addCategory, addMultipleMaterials } = useAppContext();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const stockFilter = searchParams.get('filter');
  const categoryFilter = searchParams.get('category');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMaterials = useMemo(() => {
    let filtered = [...materials];

    if (searchQuery) {
        filtered = filtered.filter(m =>
            m.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    if (categoryFilter) {
      filtered = filtered.filter(m => m.category === categoryFilter);
    }
    
    if (stockFilter === 'low_stock') {
      const lowStockItems = filtered.filter(m => m.currentStock < m.minStock);
      const normalStockItems = filtered.filter(m => m.currentStock >= m.minStock);
      // Sort both groups alphabetically before merging
      lowStockItems.sort((a, b) => a.name.localeCompare(b.name));
      normalStockItems.sort((a, b) => a.name.localeCompare(b.name));
      return [...lowStockItems, ...normalStockItems];
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [materials, stockFilter, categoryFilter, searchQuery]);

  const handleCategoryChange = (category: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (category === 'all') {
      current.delete('category');
    } else {
      current.set('category', category);
    }
    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.push(`${pathname}${query}`);
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
        <div className="flex items-center gap-2 flex-wrap">
           <MaterialExporter materials={filteredMaterials} />
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

       <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
            <Label htmlFor="search-filter" className="sr-only">Pesquisar</Label>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    id="search-filter"
                    placeholder="Pesquisar material..."
                    className="w-64 pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </div>
        <div className="flex items-center gap-2">
            <Label htmlFor="category-filter" className="sr-only">Filtrar Categoria</Label>
            <Select onValueChange={handleCategoryChange} value={categoryFilter || 'all'}>
                <SelectTrigger id="category-filter" className="w-[200px]">
                    <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todas as Categorias</SelectItem>
                    {categories.filter(cat => cat && cat.trim() !== '').map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
      </div>

      <MaterialsTable 
        data={filteredMaterials} 
        onSave={updateMaterial} 
        onDelete={deleteMaterial}
        onDeleteMultiple={deleteMultipleMaterials}
        categories={categories} 
      />
    </div>
  );
}

export default function MaterialsPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <MaterialsPageContent />
    </Suspense>
  )
}
