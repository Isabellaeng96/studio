"use client";

import {
  ArrowDownCircle,
  ArrowUpCircle,
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
import type { Material, Transaction, CostCenter } from '@/types';
import { useEffect, useState, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TransactionsTableProps {
  data: Transaction[];
  materials: Material[];
}

export function TransactionsTable({ data, materials }: TransactionsTableProps) {
  const [isClient, setIsClient] = useState(false);
  const { costCenters } = useAppContext();

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Histórico de Transações</CardTitle>
          <CardDescription>
            {data.length > 0
              ? `Exibindo ${data.length} transaç${data.length === 1 ? 'ão' : 'ões'} encontrad${data.length === 1 ? 'a' : 'as'}.`
              : 'Nenhuma transação encontrada para os filtros aplicados.'}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0">
         <ScrollArea className="h-[60vh] w-full">
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
              {data.map(tx => (
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
                      <TableCell>{isClient ? format(new Date(tx.date), 'dd/MM/yyyy') : ''}</TableCell>
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
                           <div><span className="font-semibold">Data:</span> {isClient ? format(new Date(tx.date), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR }) : ''}</div>
                           <div><span className="font-semibold">Responsável:</span> {tx.responsible}</div>
                           {tx.costCenter && <div><span className="font-semibold">Centro de Custo:</span> {costCenters.find(c => c.name === tx.costCenter)?.name || tx.costCenter}</div>}
                           {tx.type === 'entrada' && tx.supplier && <div><span className="font-semibold">Fornecedor:</span> {tx.supplier}</div>}
                           {tx.invoice && <div><span className="font-semibold">Nota Fiscal:</span> {tx.invoice}</div>}
                           {tx.type === 'saida' && tx.osNumber && <div><span className="font-semibold">Nº da OS:</span> {tx.osNumber}</div>}
                           {tx.stockLocation && <div><span className="font-semibold">Local do Estoque:</span> {tx.stockLocation}</div>}
                        </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
              {data.length === 0 && (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        Nenhuma transação encontrada.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
