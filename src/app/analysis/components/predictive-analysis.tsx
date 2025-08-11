"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BrainCircuit, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { predictMaterialConsumption, type PredictiveInventoryAnalysisOutput } from "@/ai/flows/predictive-inventory-analysis";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Material, Transaction } from "@/types";

const predictiveSchema = z.object({
  materialId: z.string().min(1, 'Por favor, selecione um material.'),
  forecastHorizon: z.string().min(1, 'Por favor, selecione um horizonte de previsão.'),
});

type PredictiveFormValues = z.infer<typeof predictiveSchema>;

interface PredictiveAnalysisProps {
  materials: Material[];
  transactions: Transaction[];
}

export function PredictiveAnalysis({ materials, transactions }: PredictiveAnalysisProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictiveInventoryAnalysisOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<PredictiveFormValues>({
    resolver: zodResolver(predictiveSchema),
  });

  const onSubmit = async (data: PredictiveFormValues) => {
    setIsLoading(true);
    setPrediction(null);
    try {
      const material = materials.find(m => m.id === data.materialId);
      if (!material) throw new Error("Material not found");

      const historicalData = transactions
        .filter(t => t.materialId === data.materialId)
        .map(t => ({ date: new Date(t.date).toISOString().split('T')[0], quantity: t.quantity, type: t.type }));

      const result = await predictMaterialConsumption({
        materialName: material.name,
        historicalData: JSON.stringify(historicalData, null, 2),
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

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
      <Card className="md:col-span-1">
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
                name="materialId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um material" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {materials.map(m => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
      <div className="md:col-span-2">
        {isLoading && (
          <Card className="flex h-full min-h-[400px] items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-lg">Gerando previsão...</p>
              <p>A IA está analisando os dados históricos.</p>
            </div>
          </Card>
        )}
        {!isLoading && prediction && (
          <Card className="h-full min-h-[400px] bg-gradient-to-br from-primary/5 to-background">
            <CardHeader>
              <CardTitle>Resultado da Previsão</CardTitle>
              <CardDescription>
                Previsão de consumo alimentada por IA para{" "}
                <span className="font-bold text-primary">
                  {materials.find(m => m.id === form.getValues("materialId"))?.name}
                </span>{" "}
                durante o(a){" "}
                <span className="font-bold text-primary">{form.getValues("forecastHorizon")}</span>.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Consumo Previsto</CardDescription>
                  <CardTitle className="text-4xl text-primary">
                    {prediction.forecastedConsumption}
                  </CardTitle>
                </CardHeader>
                <CardFooter>
                  <p className="text-xs text-muted-foreground">unidades de uso previsto</p>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Nível de Confiança</CardDescription>
                  <CardTitle className="text-4xl text-primary">
                    {(prediction.confidenceLevel * 100).toFixed(0)}%
                  </CardTitle>
                </CardHeader>
                 <CardFooter>
                  <p className="text-xs text-muted-foreground">pontuação de confiança do modelo</p>
                </CardFooter>
              </Card>
            </CardContent>
             <CardFooter className="flex-col items-start gap-2">
                <h3 className="font-semibold">Explicação</h3>
                <p className="text-sm text-muted-foreground">{prediction.explanation}</p>
             </CardFooter>
          </Card>
        )}
        {!isLoading && !prediction && (
          <Card className="flex h-full min-h-[400px] items-center justify-center border-dashed">
            <div className="text-center text-muted-foreground">
              <BrainCircuit className="mx-auto h-12 w-12" />
              <p className="mt-4 text-lg font-medium">Aguardando Previsão</p>
              <p>Selecione um material e um horizonte para gerar uma previsão.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
