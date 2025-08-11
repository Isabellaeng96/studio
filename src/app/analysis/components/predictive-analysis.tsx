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
  materialId: z.string().min(1, 'Please select a material.'),
  forecastHorizon: z.string().min(1, 'Please select a forecast horizon.'),
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
      console.error("Prediction failed:", error);
      toast({
        variant: "destructive",
        title: "Prediction Failed",
        description: "Could not generate a forecast. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Forecast Consumption</CardTitle>
          <CardDescription>
            Use AI to predict material usage based on historical data.
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
                          <SelectValue placeholder="Select a material" />
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
                    <FormLabel>Forecast Horizon</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a period" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="next week">Next Week</SelectItem>
                        <SelectItem value="next month">Next Month</SelectItem>
                        <SelectItem value="next quarter">Next Quarter</SelectItem>
                        <SelectItem value="next 6 months">Next 6 Months</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
                Generate Forecast
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
              <p className="mt-4 text-lg">Generating prediction...</p>
              <p>The AI is analyzing historical data.</p>
            </div>
          </Card>
        )}
        {!isLoading && prediction && (
          <Card className="h-full min-h-[400px] bg-gradient-to-br from-primary/5 to-background">
            <CardHeader>
              <CardTitle>Forecast Result</CardTitle>
              <CardDescription>
                AI-powered consumption forecast for{" "}
                <span className="font-bold text-primary">
                  {materials.find(m => m.id === form.getValues("materialId"))?.name}
                </span>{" "}
                over the{" "}
                <span className="font-bold text-primary">{form.getValues("forecastHorizon")}</span>.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Forecasted Consumption</CardDescription>
                  <CardTitle className="text-4xl text-primary">
                    {prediction.forecastedConsumption}
                  </CardTitle>
                </CardHeader>
                <CardFooter>
                  <p className="text-xs text-muted-foreground">units predicted usage</p>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Confidence Level</CardDescription>
                  <CardTitle className="text-4xl text-primary">
                    {(prediction.confidenceLevel * 100).toFixed(0)}%
                  </CardTitle>
                </CardHeader>
                 <CardFooter>
                  <p className="text-xs text-muted-foreground">model confidence score</p>
                </CardFooter>
              </Card>
            </CardContent>
             <CardFooter className="flex-col items-start gap-2">
                <h3 className="font-semibold">Explanation</h3>
                <p className="text-sm text-muted-foreground">{prediction.explanation}</p>
             </CardFooter>
          </Card>
        )}
        {!isLoading && !prediction && (
          <Card className="flex h-full min-h-[400px] items-center justify-center border-dashed">
            <div className="text-center text-muted-foreground">
              <BrainCircuit className="mx-auto h-12 w-12" />
              <p className="mt-4 text-lg font-medium">Awaiting Forecast</p>
              <p>Select a material and horizon to generate a prediction.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
