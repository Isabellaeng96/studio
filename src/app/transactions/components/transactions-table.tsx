"use client";

import {
  ArrowDownCircle,
  ArrowUpCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useEffect, useState } from 'react';

interface TransactionsTableProps {
  data: Transaction[];
  materials: Material[];
}

export function TransactionsTable({ data, materials }: TransactionsTableProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const sortedData = [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Transações</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[600px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Qtd</TableHead>
                <TableHead>Nota Fiscal</TableHead>
                <TableHead>Centro de Custo</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map(tx => (
                <TableRow key={tx.id}>
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
                  <TableCell className="font-mono text-xs">{tx.invoice || '-'}</TableCell>
                   <TableCell>{tx.costCenter || '-'}</TableCell>
                  <TableCell>{isClient ? new Date(tx.date).toLocaleDateString() : ''}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
