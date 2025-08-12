"use client";

import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';
import { CostCentersTable } from './components/cost-centers-table';
import { CostCenterForm } from './components/cost-center-form';

export default function CostCentersPage() {
  const { costCenters, addCostCenter, updateCostCenter, deleteCostCenter } = useAppContext();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Centros de Custo</h1>
          <p className="text-muted-foreground">
            Gerencie os centros de custo para rastreamento de despesas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CostCenterForm onSave={addCostCenter}>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Centro de Custo
            </Button>
          </CostCenterForm>
        </div>
      </div>
      <CostCentersTable 
        data={costCenters} 
        onSave={updateCostCenter} 
        onDelete={deleteCostCenter}
      />
    </div>
  );
}
