"use client";

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { Download, Loader2, FileSpreadsheet } from 'lucide-react';

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
        'Fornecedor Padrão': m.supplier || '-',
      }));

      // Criar a planilha
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      
      // Criar o livro de trabalho
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Materiais');

      // Gerar e baixar o arquivo .xlsx
      const filename = `relatorio_materiais_${format(new Date(), 'yyyyMMdd')}.xlsx`;
      XLSX.writeFile(workbook, filename);


      toast({
        title: 'Exportação Concluída',
        description: 'Seu arquivo Excel com os materiais foi gerado com sucesso.',
      });

    } catch (error) {
      console.error("Falha ao exportar XLSX:", error);
      toast({
        variant: "destructive",
        title: "Erro na Exportação",
        description: "Não foi possível gerar o arquivo Excel. Tente novamente."
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
        <FileSpreadsheet className="mr-2 h-4 w-4" />
      )}
      Exportar Excel
    </Button>
  );
}
