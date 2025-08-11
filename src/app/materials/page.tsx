import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { materials } from '@/lib/mock-data';
import { MaterialsTable } from './components/materials-table';
import { MaterialForm } from './components/material-form';

export default function MaterialsPage() {
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
          <MaterialForm>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Material
            </Button>
          </MaterialForm>
        </div>
      </div>
      <MaterialsTable data={materials} />
    </div>
  );
}
