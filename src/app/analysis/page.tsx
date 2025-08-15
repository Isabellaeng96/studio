
"use client";

import { useState, useMemo } from 'react';
import { DateRange } from 'react-day-picker';
import { addDays, eachDayOfInterval, format, isAfter, isBefore, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, FileText, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartsView } from "./components/charts";
import { PredictiveAnalysis } from "./components/predictive-analysis";
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';


export default function AnalysisPage() {
  const { activeMaterials, transactions } = useAppContext();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('charts');
  const [isLoading, setIsLoading] = useState(false);
  
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const txDate = new Date(tx.date);
      const fromDate = date?.from ? new Date(date.from.setHours(0, 0, 0, 0)) : null;
      const toDate = date?.to ? new Date(date.to.setHours(23, 59, 59, 999)) : null;

      if (fromDate && isBefore(txDate, fromDate)) return false;
      if (toDate && isAfter(txDate, toDate)) return false;
      return true;
    });
  }, [transactions, date]);

  const transactionTrendData = useMemo(() => {
    if (!date?.from || !date?.to) return [];

    const intervalDays = eachDayOfInterval({ start: date.from, end: date.to });
    const data = intervalDays.map(day => ({
        date: format(day, "MMM dd"),
        entrada: 0,
        saida: 0,
    }));

    filteredTransactions.forEach(tx => {
      const dateStr = format(new Date(tx.date), "MMM dd");
      const entry = data.find(d => d.date === dateStr);
      if (entry) {
        if (tx.type === "entrada") entry.entrada += tx.quantity;
        else entry.saida += tx.quantity;
      }
    });

    return data;
  }, [filteredTransactions, date]);
  
  const stockTurnoverData = useMemo(() => {
    return activeMaterials.map(material => {
        const totalExits = filteredTransactions
            .filter(t => t.materialId === material.id && t.type === 'saida')
            .reduce((sum, t) => sum + t.quantity, 0);
        
        const startStock = material.currentStock - filteredTransactions
          .filter(t => t.materialId === material.id)
          .reduce((sum, t) => sum + (t.type === 'entrada' ? -t.quantity : t.quantity), 0);
        
        const endStock = material.currentStock;
        
        const avgStock = (startStock + endStock) / 2;

        return {
            name: material.name,
            turnover: avgStock > 0 ? parseFloat((totalExits / avgStock).toFixed(2)) : 0
        };
    });
  }, [activeMaterials, filteredTransactions]);
  
   const handleExport = () => {
    setIsLoading(true);
    try {
      const doc = new jsPDF();
      const generationDate = new Date();
      
      doc.setFontSize(18);
      doc.text('Relatório de Análise - Entradas e Saídas', 14, 22);
      doc.setFontSize(11);
      const period = `Período: ${date?.from ? format(date.from, 'dd/MM/yyyy') : 'N/A'} a ${date?.to ? format(date.to, 'dd/MM/yyyy') : 'N/A'}`;
      doc.text(period, 14, 30);

      autoTable(doc, {
        startY: 40,
        head: [['Data', 'Entradas', 'Saídas']],
        body: transactionTrendData.map(d => [d.date, d.entrada, d.saida]),
        styles: { fontSize: 10 },
        headStyles: { fillColor: '#3b82f6' },
        didDrawPage: (data) => {
            const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
            const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
            doc.setFontSize(8);
            doc.text(`Gerado por: ${user?.displayName || 'N/A'}`, data.settings.margin.left, pageHeight - 10);
            doc.text(`Página ${data.pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
            doc.text(`Data: ${format(generationDate, 'dd/MM/yyyy HH:mm:ss')}`, pageWidth - data.settings.margin.right, pageHeight - 10, { align: 'right' });
        }
      });
      
      doc.save(`relatorio_entrada_saida_${format(new Date(), 'yyyyMMdd')}.pdf`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }


  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Análise e Previsão</h1>
        <p className="text-muted-foreground">
          Visualize dados de estoque e preveja necessidades futuras.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="charts">Visualização de Dados</TabsTrigger>
          <TabsTrigger value="predictive">Análise Preditiva</TabsTrigger>
        </TabsList>
        <TabsContent value="charts" className="mt-6 space-y-6">
           <div className="flex flex-wrap items-center gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn('w-[280px] justify-start text-left font-normal', !date && 'text-muted-foreground')}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, 'dd MMM, yyyy', { locale: ptBR })} - {format(date.to, 'dd MMM, yyyy', { locale: ptBR })}
                        </>
                      ) : (
                        format(date.from, 'dd MMM, yyyy', { locale: ptBR })
                      )
                    ) : (
                      <span>Escolha um período</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
               <Button onClick={handleExport} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                Exportar PDF
              </Button>
            </div>
          <ChartsView 
            transactionTrendData={transactionTrendData}
            stockTurnoverData={stockTurnoverData}
          />
        </TabsContent>
        <TabsContent value="predictive" className="mt-6">
          <PredictiveAnalysis materials={activeMaterials} transactions={transactions}/>
        </TabsContent>
      </Tabs>
    </div>
  );
}
