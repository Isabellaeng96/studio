"use client";

import { useState } from 'react';
import Papa from 'papaparse';
import { format } from 'date-fns';
import { Download, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Material } from '@/types';

interface MaterialExporterProps {
  materials: Material[];
}

export function MaterialExporter({ materials }: MaterialExporterProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleExport = () => {
    setIsLoading(true);
    try {
      if (materials.length === 0) {
        toast({
          variant: 'destructive',
          title: 'Nenhum Material',
          description: 'Não há materiais para exportar.',
        });
        return;
      }

      const dataToExport = materials.map(m => ({
        'Nome': m.name,
        'Código': m.id,
        'Categoria': m.category,
        'Unidade': m.unit,
        'Estoque Atual': m.currentStock,
        'Estoque Mínimo': m.minStock,
      }));

      const csv = Papa.unparse(dataToExport);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      const filename = `relatorio_materiais_${format(new Date(), 'yyyyMMdd')}.csv`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Exportação Concluída',
        description: 'Seu arquivo CSV com os materiais foi gerado com sucesso.',
      });

    } catch (error) {
      console.error("Falha ao exportar CSV:", error);
      toast({
        variant: "destructive",
        title: "Erro na Exportação",
        description: "Não foi possível gerar o arquivo CSV. Tente novamente."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleExport} disabled={isLoading} variant="outline">
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      Exportar CSV
    </Button>
  );
}
