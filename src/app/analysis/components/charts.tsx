
"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, LabelList, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface ChartsViewProps {
  entryTrendData: { date: string; value: number; }[];
  exitTrendData: { date: string; value: number; }[];
  stockTurnoverData: { name: string; turnover: number; }[];
  lowStockMaterialsData: { name: string; currentStock: number; minStock: number; }[];
}

export function ChartsView({ entryTrendData, exitTrendData, stockTurnoverData, lowStockMaterialsData }: ChartsViewProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-1">
       <Card className="chart-card">
        <CardHeader>
          <CardTitle>Fluxo de Entradas</CardTitle>
          <CardDescription>Acompanha o volume de materiais que entraram no estoque para o período selecionado.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{
            value: {
              label: "Entradas",
              color: "hsl(var(--primary))",
            }
          }} className="h-80 w-full">
             <ResponsiveContainer>
              <BarChart data={entryTrendData} margin={{ top: 30, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid vertical={false}/>
                <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" name="Entradas" fill="hsl(var(--primary))" radius={4}>
                   <LabelList dataKey="value" position="top" offset={8} fontSize={12} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card className="chart-card">
        <CardHeader>
          <CardTitle>Fluxo de Saídas</CardTitle>
          <CardDescription>Acompanha o volume de materiais que saíram do estoque para o período selecionado.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{
            value: {
              label: "Saídas",
              color: "hsl(var(--destructive))",
            }
          }} className="h-80 w-full">
             <ResponsiveContainer>
              <BarChart data={exitTrendData} margin={{ top: 30, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid vertical={false}/>
                <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" name="Saídas" fill="hsl(var(--destructive))" radius={4}>
                  <LabelList dataKey="value" position="top" offset={8} fontSize={12} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card className="chart-card">
        <CardHeader>
          <CardTitle>Materiais com Estoque Baixo</CardTitle>
          <CardDescription>Materiais com estoque atual igual ou inferior ao mínimo definido.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{
              currentStock: { label: "Estoque Atual", color: "hsl(var(--destructive))" },
              minStock: { label: "Estoque Mínimo", color: "hsl(var(--muted-foreground))" },
          }} className="h-96 w-full">
            <ResponsiveContainer>
              <BarChart data={lowStockMaterialsData} layout="vertical" margin={{ top: 20, right: 50, left: 100, bottom: 0 }}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={120} />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="minStock" name="Estoque Mínimo" fill="hsl(var(--muted-foreground))" radius={4} />
                <Bar dataKey="currentStock" name="Estoque Atual" fill="hsl(var(--destructive))" radius={4}>
                   <LabelList dataKey="currentStock" position="right" offset={8} fontSize={12} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
       <Card className="chart-card">
        <CardHeader>
          <CardTitle>Giro de Estoque</CardTitle>
          <CardDescription>Mede a frequência com que o estoque é vendido e reposto durante um período.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-80 w-full">
            <ResponsiveContainer>
              <BarChart data={stockTurnoverData} layout="vertical" margin={{ top: 20, right: 50, left: 120, bottom: 0 }}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={120} />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="turnover" name="Giro de Estoque" fill="hsl(var(--primary))" radius={4}>
                   <LabelList dataKey="turnover" position="right" offset={8} fontSize={12} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
