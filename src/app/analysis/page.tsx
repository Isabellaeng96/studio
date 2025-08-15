
"use client";

import { useState, useMemo, useRef } from 'react';
import { DateRange } from 'react-day-picker';
import { addDays, eachDayOfInterval, format, isAfter, isBefore, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, FileText, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartsView } from "./components/charts";
import { PredictiveAnalysis } from "./components/predictive-analysis";
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Calendar } from '@/components/ui/calendar';


export default function AnalysisPage() {
  const { activeMaterials, transactions } = useAppContext();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('charts');
  const [isLoading, setIsLoading] = useState(false);
  
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  
  const chartsRef = useRef<HTMLDivElement>(null);

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

  const entryTrendData = useMemo(() => {
    if (!date?.from || !date?.to) return [];

    const intervalDays = eachDayOfInterval({ start: date.from, end: date.to });
    const data = intervalDays.map(day => ({
        date: format(day, "MMM dd"),
        value: 0,
    }));

    filteredTransactions.forEach(tx => {
      if (tx.type === "entrada") {
        const dateStr = format(new Date(tx.date), "MMM dd");
        const entry = data.find(d => d.date === dateStr);
        if (entry) {
          entry.value += tx.quantity;
        }
      }
    });

    return data;
  }, [filteredTransactions, date]);
  
  const exitTrendData = useMemo(() => {
    if (!date?.from || !date?.to) return [];

    const intervalDays = eachDayOfInterval({ start: date.from, end: date.to });
    const data = intervalDays.map(day => ({
        date: format(day, "MMM dd"),
        value: 0,
    }));

    filteredTransactions.forEach(tx => {
      if (tx.type === "saida") {
        const dateStr = format(new Date(tx.date), "MMM dd");
        const entry = data.find(d => d.date === dateStr);
        if (entry) {
          entry.value += tx.quantity;
        }
      }
    });

    return data;
  }, [filteredTransactions, date]);
  
  const stockTurnoverData = useMemo(() => {
    return activeMaterials
      .map(material => {
        const totalExits = filteredTransactions
          .filter(t => t.materialId === material.id && t.type === 'saida')
          .reduce((sum, t) => sum + t.quantity, 0);

        if (totalExits === 0) {
          return { name: material.name, turnover: 0 };
        }

        const startStock = material.currentStock - filteredTransactions
          .filter(t => t.materialId === material.id)
          .reduce((sum, t) => sum + (t.type === 'entrada' ? -t.quantity : t.quantity), 0);
        
        const endStock = material.currentStock;
        
        const avgStock = (startStock + endStock) / 2;

        return {
            name: material.name,
            turnover: avgStock > 0 ? parseFloat((totalExits / avgStock).toFixed(2)) : 0
        };
      })
      .filter(item => item.turnover > 0);
  }, [activeMaterials, filteredTransactions]);
  
  const addFooterToAllPages = (pdf: jsPDF) => {
    const pageCount = (pdf as any).internal.getNumberOfPages();
    const generationDate = new Date();

    for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        const userText = `Gerado por: ${user?.displayName || 'N/A'}`;
        const dateText = `Data: ${format(generationDate, 'dd/MM/yyyy HH:mm:ss')}`;
        const pageText = `Página ${i} de ${pageCount}`;

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        pdf.text(userText, 14, pageHeight - 10);
        pdf.text(pageText, pageWidth / 2, pageHeight - 10, { align: 'center' });
        pdf.text(dateText, pageWidth - 14, pageHeight - 10, { align: 'right' });
    }
  };

   const handleExport = async () => {
    setIsLoading(true);
    const chartsContainer = chartsRef.current;
    if (!chartsContainer) {
      setIsLoading(false);
      return;
    }
    
    const chartCards = Array.from(chartsContainer.querySelectorAll('.recharts-responsive-container + .recharts-responsive-container ~ div, .recharts-responsive-container'))
        .map(el => el.closest('.lucide, .recharts-surface, .text-2xl, button, .flex, .grid, .h-80, .h-\[60vh\], .sticky, .h-full, .h-20, .h-14, .h-24, .h-96, .h-48, .h-72, .h-9, .h-6, .h-12, .h-4, .w-full, .w-20, .w-64, .w-\[200px\], .w-\[280px\], .w-auto, .w-48, .w-12, .w-\[50px\], .w-96, .w-6, .w-4, body, .grid-cols-1, .grid-cols-2, .grid-cols-5, .md\:grid-cols-3, .md\:col-span-1, .md\:col-span-2, .lg\:grid-cols-\[280px_1fr\], .lg\:grid-cols-1, .lg\:grid-cols-3, .lg\:col-span-2, .sm\:grid-cols-1, .sm\:grid-cols-2, .sm\:max-w-4xl, .sm\:max-w-md, .sm\:max-w-\[425px\], card'))
        .filter((card, index, self) => card && self.indexOf(card) === index) as HTMLElement[];

    if(chartCards.length === 0) {
        // Fallback to the original method if no cards are found
        chartCards.push(chartsContainer);
    }
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yPosition = margin + 25; // Initial Y position for the first chart

      // Header
      pdf.setFontSize(18);
      pdf.text('Relatório de Análise Gráfica', margin, 22);
      pdf.setFontSize(11);
      const period = `Período: ${date?.from ? format(date.from, 'dd/MM/yyyy') : 'N/A'} a ${date?.to ? format(date.to, 'dd/MM/yyyy') : 'N/A'}`;
      pdf.text(period, margin, 30);
      
      for (const [index, chartCard] of chartCards.entries()) {
        const canvas = await html2canvas(chartCard, {
            scale: 2,
            backgroundColor: '#ffffff'
        });
        const imgData = canvas.toDataURL('image/jpeg', 0.9);
        const imgWidth = pdfWidth - (margin * 2);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        if (yPosition + imgHeight > pdfHeight - margin) {
          pdf.addPage();
          yPosition = margin; // Reset Y position for new page
        }

        pdf.addImage(imgData, 'JPEG', margin, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 10; // Add some space between charts
      }

      addFooterToAllPages(pdf);
      pdf.save(`relatorio_graficos_${format(new Date(), 'yyyyMMdd')}.pdf`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };


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
            <div ref={chartsRef}>
              <ChartsView 
                entryTrendData={entryTrendData}
                exitTrendData={exitTrendData}
                stockTurnoverData={stockTurnoverData}
              />
            </div>
        </TabsContent>
        <TabsContent value="predictive" className="mt-6">
          <PredictiveAnalysis materials={activeMaterials} transactions={transactions}/>
        </TabsContent>
      </Tabs>
    </div>
  );
}

