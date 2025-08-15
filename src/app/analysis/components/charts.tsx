"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { Material, Transaction } from "@/types";
import { useMemo } from "react";
import { format, subDays } from "date-fns";

interface ChartsViewProps {
  materials: Material[];
  transactions: Transaction[];
}

export function ChartsView({ materials, transactions }: ChartsViewProps) {
  const transactionTrendData = useMemo(() => {
    const data = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      return {
        date: format(date, "MMM dd"),
        entrada: 0,
        saida: 0,
      };
    });

    transactions.forEach(tx => {
      const dateStr = format(new Date(tx.date), "MMM dd");
      const entry = data.find(d => d.date === dateStr);
      if (entry) {
        if (tx.type === "entrada") entry.entrada += tx.quantity;
        else entry.saida += tx.quantity;
      }
    });

    return data;
  }, [transactions]);
  
  const stockTurnoverData = materials.map(material => {
      const totalExits = transactions
          .filter(t => t.materialId === material.id && t.type === 'saida')
          .reduce((sum, t) => sum + t.quantity, 0);
      const avgStock = (material.currentStock + (material.currentStock - totalExits)) / 2; // Simplified avg
      return {
          name: material.name,
          turnover: avgStock > 0 ? parseFloat((totalExits / avgStock).toFixed(2)) : 0
      };
  });


  return (
    <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-1">
      <Card>
        <CardHeader>
          <CardTitle>Entradas vs. Saídas (Últimos 30 dias)</CardTitle>
          <CardDescription>Acompanha o fluxo de materiais ao longo do tempo.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-80 w-full">
             <ResponsiveContainer>
              <LineChart data={transactionTrendData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid vertical={false}/>
                <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="entrada" name="Entradas" stroke="var(--color-chart-1)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="saida" name="Saídas" stroke="var(--color-chart-2)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
          <CardTitle>Giro de Estoque</CardTitle>
          <CardDescription>Mede a frequência com que o estoque é vendido e reposto durante um período.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-80 w-full">
            <ResponsiveContainer>
              <BarChart data={stockTurnoverData} layout="vertical" margin={{ top: 20, right: 20, left: 50, bottom: 0 }}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={120} />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="turnover" name="Giro de Estoque" fill="var(--color-chart-3)" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
