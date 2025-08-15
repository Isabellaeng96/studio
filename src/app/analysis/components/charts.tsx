
"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import type { Material } from "@/types";

interface ChartsViewProps {
  transactionTrendData: { date: string; entrada: number; saida: number; }[];
  stockTurnoverData: { name: string; turnover: number; }[];
}

export function ChartsView({ transactionTrendData, stockTurnoverData }: ChartsViewProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-1">
      <Card>
        <CardHeader>
          <CardTitle>Entrada e Saída</CardTitle>
          <CardDescription>Acompanha o fluxo de materiais ao longo do tempo para o período selecionado.</CardDescription>
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
