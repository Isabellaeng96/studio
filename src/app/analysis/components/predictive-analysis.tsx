
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BrainCircuit, Check, ChevronsUpDown, Loader2, FileText } from "lucide-react";
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { format } from "date-fns";

import { predictMaterialConsumption, type PredictiveInventoryAnalysisOutput } from "@/ai/flows/predictive-inventory-analysis";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Material, Transaction } from "@/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";

const predictiveSchema = z.object({
  materialIds: z.array(z.string()).min(1, 'Por favor, selecione pelo menos um material.'),
  forecastHorizon: z.string().min(1, 'Por favor, selecione um horizonte de previsão.'),
});

type PredictiveFormValues = z.infer<typeof predictiveSchema>;

interface PredictiveAnalysisProps {
  materials: Material[];
  transactions: Transaction[];
}

export function PredictiveAnalysis({ materials, transactions }: PredictiveAnalysisProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [prediction, setPrediction] = useState<PredictiveInventoryAnalysisOutput | null>(null);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const predictionResultsRef = useRef<HTMLDivElement>(null);

  const form = useForm<PredictiveFormValues>({
    resolver: zodResolver(predictiveSchema),
    defaultValues: {
        materialIds: [],
    },
  });

  const onSubmit = async (data: PredictiveFormValues) => {
    setIsLoading(true);
    setPrediction(null);
    try {
      const materialsToPredict = data.materialIds.map(id => {
        const material = materials.find(m => m.id === id);
        if (!material) throw new Error(`Material com id ${id} não encontrado`);
        
        const historicalData = transactions
          .filter(t => t.materialId === id)
          .map(t => ({ date: new Date(t.date).toISOString().split('T')[0], quantity: t.quantity, type: t.type }));

        return {
          materialName: material.name,
          historicalData: JSON.stringify(historicalData, null, 2),
        };
      });

      const result = await predictMaterialConsumption({
        materials: materialsToPredict,
        forecastHorizon: data.forecastHorizon,
      });

      setPrediction(result);
    } catch (error) {
      console.error("Falha na predição:", error);
      toast({
        variant: "destructive",
        title: "Falha na Predição",
        description: "Não foi possível gerar uma previsão. Por favor, tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExport = async () => {
    if (!predictionResultsRef.current) return;
    setIsExporting(true);

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    let yPosition = margin;

    // Cabeçalho do PDF
    pdf.setFontSize(18);
    pdf.text('Relatório de Análise Preditiva', margin, yPosition);
    yPosition += 8;
    pdf.setFontSize(11);
    const period = `Período de Previsão: ${form.getValues("forecastHorizon")}`;
    pdf.text(period, margin, yPosition);
    yPosition += 12;
    
    const predictionCards = Array.from(
      predictionResultsRef.current.querySelectorAll('.prediction-card')
    ) as HTMLElement[];

    const cardWidth = (pdfWidth - (margin * 3)) / 2;
    let xPosition = margin;
    let maxHeightInRow = 0;

    for (let i = 0; i < predictionCards.length; i++) {
        const cardElement = predictionCards[i];
        
        // Esconde a explicação
        const footerElement = cardElement.querySelector('.prediction-footer') as HTMLElement;
        if (footerElement) {
            footerElement.style.display = 'none';
        }

        const canvas = await html2canvas(cardElement, {
            scale: 2,
            backgroundColor: '#ffffff'
        });

        // Mostra a explicação de novo
        if (footerElement) {
            footerElement.style.display = '';
        }

        const cardHeight = (canvas.height * cardWidth) / canvas.width;
        
        if (yPosition + cardHeight > pdfHeight - margin) {
            pdf.addPage();
            yPosition = margin;
            xPosition = margin;
            maxHeightInRow = 0;
        }
        
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.9), 'JPEG', xPosition, yPosition, cardWidth, cardHeight);
        
        if (i % 2 === 0) { // Ímpar (primeiro da linha)
            xPosition += cardWidth + margin;
            maxHeightInRow = cardHeight;
        } else { // Par (segundo da linha)
            xPosition = margin;
            yPosition += Math.max(maxHeightInRow, cardHeight) + 10;
            maxHeightInRow = 0;
        }
    }
    
    // Rodapé
    const pageCount = (pdf as any).internal.getNumberOfPages();
    const generationDate = new Date();
    for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        const userText = `Gerado por: ${user?.displayName || 'N/A'}`;
        const dateText = `Data: ${format(generationDate, 'dd/MM/yyyy HH:mm:ss')}`;
        const pageText = `Página ${i} de ${pageCount}`;

        pdf.text(userText, 14, pdfHeight - 10);
        pdf.text(pageText, pdfWidth / 2, pdfHeight - 10, { align: 'center' });
        pdf.text(dateText, pdfWidth - 14, pdfHeight - 10, { align: 'right' });
    }

    pdf.save(`relatorio_preditivo_${format(new Date(), 'yyyyMMdd')}.pdf`);
    setIsExporting(false);
  };
  
  const selectedMaterials = form.watch('materialIds');

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
      <div className="md:col-span-1">
        <Card>
            <CardHeader>
            <CardTitle>Previsão de Consumo</CardTitle>
            <CardDescription>
                Use IA para prever o uso de material com base em dados históricos.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="materialIds"
                    render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Materiais</FormLabel>
                        <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <FormControl>
                            <Button
                                variant="outline"
                                role="combobox"
                                className={cn("w-full justify-between h-auto", !field.value?.length && "text-muted-foreground")}
                            >
                                <div className="flex gap-1 flex-wrap">
                                    {selectedMaterials.length > 0 ? selectedMaterials.map(id => {
                                        const mat = materials.find(m => m.id === id);
                                        return mat ? <Badge key={id} variant="secondary">{mat.name}</Badge> : null;
                                    }) : "Selecione os materiais"}
                                </div>
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                            <Command>
                            <CommandInput placeholder="Buscar material..." />
                             <CommandList>
                                <CommandEmpty>Nenhum material encontrado.</CommandEmpty>
                                <CommandGroup>
                                    {materials.map((material) => (
                                    <CommandItem
                                        key={material.id}
                                        value={material.name}
                                        onSelect={() => {
                                            const currentValues = form.getValues("materialIds");
                                            if (currentValues.includes(material.id)) {
                                                form.setValue("materialIds", currentValues.filter(id => id !== material.id));
                                            } else {
                                                form.setValue("materialIds", [...currentValues, material.id]);
                                            }
                                        }}
                                    >
                                        <Check
                                        className={cn("mr-2 h-4 w-4", field.value?.includes(material.id) ? "opacity-100" : "opacity-0")}
                                        />
                                        {material.name}
                                    </CommandItem>
                                    ))}
                                </CommandGroup>
                             </CommandList>
                            </Command>
                        </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="forecastHorizon"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Horizonte de Previsão</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder="Selecione um período" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="próxima semana">Próxima Semana</SelectItem>
                            <SelectItem value="próximo mês">Próximo Mês</SelectItem>
                            <SelectItem value="próximo trimestre">Próximo Trimestre</SelectItem>
                            <SelectItem value="próximos 6 meses">Próximos 6 Meses</SelectItem>
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
                    Gerar Previsão
                </Button>
                </form>
            </Form>
            </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        {isLoading && (
          <Card className="flex h-full min-h-[400px] items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-lg">Gerando previsões...</p>
              <p>A IA está analisando os dados históricos.</p>
            </div>
          </Card>
        )}
        {!isLoading && prediction && (
            <div ref={predictionResultsRef} className="space-y-6">
                <Card className="bg-gradient-to-br from-primary/5 to-background">
                     <CardHeader className="flex-row items-center justify-between">
                        <div>
                            <CardTitle>Resultados da Previsão</CardTitle>
                            <CardDescription>
                                Previsão de consumo para o(a) <span className="font-bold text-primary">{form.getValues("forecastHorizon")}</span>.
                            </CardDescription>
                        </div>
                        <Button onClick={handleExport} disabled={isExporting}>
                          {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                          Exportar PDF
                        </Button>
                    </CardHeader>
                </Card>
                <div className="grid grid-cols-1 gap-6">
                    {prediction.predictions.map((pred, index) => (
                        <Card key={index} className="prediction-card">
                            <CardHeader>
                                <CardTitle className="text-xl">{pred.materialName}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Card className="p-4">
                                        <CardDescription>Consumo Previsto</CardDescription>
                                        <CardTitle className="text-3xl">
                                            {pred.forecastedConsumption}
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground pt-1">unidades de uso previsto</p>
                                    </Card>
                                    <Card className="p-4">
                                        <CardDescription>Nível de Confiança</CardDescription>
                                        <CardTitle className="text-3xl text-primary">
                                            {(pred.confidenceLevel * 100).toFixed(0)}%
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground pt-1">pontuação de confiança</p>
                                    </Card>
                                </div>
                            </CardContent>
                            <CardFooter className="prediction-footer flex-col items-start gap-2 pt-4">
                                <h3 className="font-semibold">Explicação da IA</h3>
                                <p className="text-sm text-muted-foreground">{pred.explanation}</p>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        )}
        {!isLoading && !prediction && (
          <Card className="flex h-full min-h-[400px] items-center justify-center border-dashed">
            <div className="text-center text-muted-foreground">
              <BrainCircuit className="mx-auto h-12 w-12" />
              <p className="mt-4 text-lg font-medium">Aguardando Previsão</p>
              <p>Selecione um ou mais materiais e um horizonte para gerar uma previsão.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
