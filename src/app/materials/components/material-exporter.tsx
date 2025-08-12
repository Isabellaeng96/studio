
"use client";

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { Download, Loader2, ChevronDown, FileSpreadsheet, FileText, FileType } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import type { User } from 'firebase/auth';


import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Material } from '@/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface MaterialExporterProps {
  materials: Material[];
  user: User | null;
}

type ExportFormat = 'xlsx' | 'csv' | 'pdf';

export function MaterialExporter({ materials, user }: MaterialExporterProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const dataToExport = materials.map(m => ({
    'Nome': m.name,
    'Código': m.id,
    'Categoria': m.category,
    'Unidade': m.unit,
    'Estoque Atual': m.currentStock,
    'Estoque Mínimo': m.minStock,
    'Fornecedor Padrão': m.supplier || '-',
  }));

  const handleExport = (formatType: ExportFormat) => {
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
      
      const filename = `relatorio_materiais_${format(new Date(), 'yyyyMMdd')}`;

      if (formatType === 'xlsx') {
        exportToXLSX(filename);
      } else if (formatType === 'csv') {
        exportToCSV(filename);
      } else if (formatType === 'pdf') {
        exportToPDF(filename);
      }

      toast({
        title: 'Exportação Concluída',
        description: `Seu arquivo ${formatType.toUpperCase()} com os materiais foi gerado com sucesso.`,
      });

    } catch (error) {
      console.error(`Falha ao exportar ${formatType.toUpperCase()}:`, error);
      toast({
        variant: "destructive",
        title: "Erro na Exportação",
        description: `Não foi possível gerar o arquivo ${formatType.toUpperCase()}. Tente novamente.`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportToXLSX = (filename: string) => {
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Materiais');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const exportToCSV = (filename: string) => {
    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const exportToPDF = (filename: string) => {
    const doc = new jsPDF();
    const generationDate = new Date();
    
    doc.setFontSize(18);
    doc.text('Relatório de Materiais', 14, 22);
    
    autoTable(doc, {
      startY: 30,
      head: [Object.keys(dataToExport[0])],
      body: dataToExport.map(Object.values),
      styles: { fontSize: 8 },
      headStyles: { fillColor: '#3b82f6' },
      didDrawPage: (data) => {
        // Footer
        const str = `Página ${data.pageNumber}`;
        doc.setFontSize(8);
        
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
        const pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth();
        
        const userText = `Gerado por: ${user?.displayName || 'N/A'}`;
        const dateText = `Data: ${format(generationDate, 'dd/MM/yyyy HH:mm:ss')}`;
        
        doc.text(userText, data.settings.margin.left, pageHeight - 10);
        doc.text(str, pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.text(dateText, pageWidth - data.settings.margin.right, pageHeight - 10, { align: 'right' });
      }
    });

    doc.save(`${filename}.pdf`);
  };


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isLoading}>
           {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Exportar
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleExport('xlsx')}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            <span>Exportar para .xlsx</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('csv')}>
            <FileType className="mr-2 h-4 w-4" />
            <span>Exportar para .csv</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Exportar para .pdf</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
