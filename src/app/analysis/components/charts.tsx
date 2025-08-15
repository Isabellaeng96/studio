
"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface ChartsViewProps {
  entryTrendData: { date: string; value: number; }[];
  exitTrendData: { date: string; value: number; }[];
  stockTurnoverData: { name: string; turnover: number; }[];
}

export function ChartsView({ entryTrendData, exitTrendData, stockTurnoverData }: ChartsViewProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-1">
       <Card>
        <CardHeader>
          <CardTitle>Fluxo de Entradas</CardTitle>
          <CardDescription>Acompanha o volume de materiais que entraram no estoque para o período selecionado.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{
            value: {
              label: "Entradas",
              color: "hsl(var(--chart-1))",
            }
          }} className="h-80 w-full">
             <ResponsiveContainer>
              <BarChart data={entryTrendData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid vertical={false}/>
                <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" name="Entradas" fill="hsl(var(--primary))" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Fluxo de Saídas</CardTitle>
          <CardDescription>Acompanha o volume de materiais que saíram do estoque para o período selecionado.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-80 w-full">
             <ResponsiveContainer>
              <BarChart data={exitTrendData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid vertical={false}/>
                <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" name="Saídas" fill="var(--color-chart-2)" radius={4} />
              </BarChart>
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
