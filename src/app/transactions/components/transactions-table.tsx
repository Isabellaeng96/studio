
"use client";

import {
  ArrowDownCircle,
  ArrowUpCircle,
  FileText,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { Material, Transaction } from '@/types';
import { useEffect, useState, useMemo } from 'react';
import { TransactionExporter } from './transaction-exporter';

interface TransactionsTableProps {
  data: Transaction[];
  materials: Material[];
}

export function TransactionsTable({ data, materials }: TransactionsTableProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const recentTransactions = useMemo(() => {
    return [...data]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 15);
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle>Histórico de Transações Recentes</CardTitle>
            <CardDescription>Visualize e exporte o histórico das últimas 15 movimentações.</CardDescription>
          </div>
          <TransactionExporter transactions={data} materials={materials} />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[600px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Qtd</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Centro de Custo</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.map(tx => (
                <Dialog key={tx.id}>
                  <DialogTrigger asChild>
                    <TableRow className="cursor-pointer">
                      <TableCell className="font-medium">{materials.find(m => m.id === tx.materialId)?.name || tx.materialId}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            'border-2',
                            tx.type === 'entrada'
                              ? 'text-emerald-500 border-emerald-500/50'
                              : 'text-amber-500 border-amber-500/50'
                          )}
                        >
                          <div className="flex items-center gap-1">
                            {tx.type === 'entrada' ? (
                              <ArrowUpCircle className="h-3 w-3" />
                            ) : (
                              <ArrowDownCircle className="h-3 w-3" />
                            )}
                            <span>{tx.type === 'entrada' ? 'Entrada' : 'Saída'}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">{tx.quantity}</TableCell>
                      <TableCell className="font-mono text-xs">{tx.invoice || tx.osNumber || '-'}</TableCell>
                      <TableCell>{tx.costCenter || '-'}</TableCell>
                      <TableCell>{isClient ? new Date(tx.date).toLocaleDateString() : ''}</TableCell>
                    </TableRow>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Detalhes da Transação</DialogTitle>
                      <DialogDescription>
                        ID da Transação: <span className="font-mono">{tx.id}</span>
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 text-sm">
                       <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                           <div><span className="font-semibold">Material:</span> {tx.materialName}</div>
                           <div><span className="font-semibold">Tipo:</span> <span className={cn(tx.type === 'entrada' ? 'text-emerald-600' : 'text-amber-600')}>{tx.type === 'entrada' ? 'Entrada' : 'Saída'}</span></div>
                           <div><span className="font-semibold">Quantidade:</span> {tx.quantity}</div>
                           <div><span className="font-semibold">Data:</span> {isClient ? new Date(tx.date).toLocaleString() : ''}</div>
                           <div><span className="font-semibold">Responsável:</span> {tx.responsible}</div>
                           {tx.costCenter && <div><span className="font-semibold">Centro de Custo:</span> {tx.costCenter}</div>}
                           {tx.type === 'entrada' && tx.supplier && <div><span className="font-semibold">Fornecedor:</span> {tx.supplier}</div>}
                           {tx.invoice && <div><span className="font-semibold">Nota Fiscal:</span> {tx.invoice}</div>}
                           {tx.type === 'saida' && tx.osNumber && <div><span className="font-semibold">Nº da OS:</span> {tx.osNumber}</div>}
                           {tx.stockLocation && <div><span className="font-semibold">Local do Estoque:</span> {tx.stockLocation}</div>}
                           {tx.type === 'saida' && tx.workFront && <div><span className="font-semibold">Frente de Trabalho:</span> {tx.workFront}</div>}
                        </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
