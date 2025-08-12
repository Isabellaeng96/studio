
"use client";

import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { addDays, format, isAfter, isBefore } from 'date-fns';
import { Calendar as CalendarIcon, FileText, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { User } from 'firebase/auth';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Material, Transaction } from '@/types';

interface TransactionExporterProps {
  transactions: Transaction[];
  materials: Material[];
  user: User | null;
}

export function TransactionExporter({ transactions, materials, user }: TransactionExporterProps) {
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleExport = () => {
    setIsLoading(true);

    try {
      const filteredTransactions = transactions.filter(tx => {
        const txDate = new Date(tx.date);
        const fromDate = date?.from ? new Date(date.from.setHours(0, 0, 0, 0)) : null;
        const toDate = date?.to ? new Date(date.to.setHours(23, 59, 59, 999)) : null;

        if (fromDate && isBefore(txDate, fromDate)) return false;
        if (toDate && isAfter(txDate, toDate)) return false;
        return true;
      });

      if (filteredTransactions.length === 0) {
        toast({
          variant: 'destructive',
          title: 'Nenhuma Transação',
          description: 'Não há transações no período selecionado para exportar.',
        });
        return;
      }
      
      const doc = new jsPDF();
      const generationDate = new Date();
      
      // Cabeçalho
      doc.setFontSize(18);
      doc.text('Relatório de Transações', 14, 22);
      doc.setFontSize(11);
      const period = `Período: ${date?.from ? format(date.from, 'dd/MM/yyyy') : 'N/A'} a ${date?.to ? format(date.to, 'dd/MM/yyyy') : 'N/A'}`;
      doc.text(period, 14, 30);

      // Tabela
      autoTable(doc, {
        startY: 40,
        head: [['Data', 'Material', 'Tipo', 'Qtd', 'Responsável', 'Doc/OS', 'Centro de Custo']],
        body: filteredTransactions.map(tx => [
          format(new Date(tx.date), 'dd/MM/yy HH:mm'),
          materials.find(m => m.id === tx.materialId)?.name || 'N/A',
          tx.type === 'entrada' ? 'Entrada' : 'Saída',
          tx.quantity.toString(),
          tx.responsible,
          tx.invoice || tx.osNumber || '-',
          tx.costCenter || '-',
        ]),
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

      doc.save(`relatorio_transacoes_${format(new Date(), 'yyyyMMdd')}.pdf`);

      toast({
        title: 'Exportação Concluída',
        description: 'Seu relatório em PDF foi gerado com sucesso.',
      });

    } catch (error) {
        console.error("Falha ao exportar PDF:", error);
        toast({
            variant: "destructive",
            title: "Erro na Exportação",
            description: "Não foi possível gerar o PDF. Tente novamente."
        })
    } finally {
        setIsLoading(false);
    }

  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={'outline'}
            className={cn(
              'w-[260px] justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
                </>
              ) : (
                format(date.from, 'LLL dd, y')
              )
            ) : (
              <span>Selecione um período</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
      <Button onClick={handleExport} disabled={isLoading || !date?.from || !date?.to}>
        {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
            <FileText className="mr-2 h-4 w-4" />
        )}
        Exportar PDF
      </Button>
    </div>
  );
}
