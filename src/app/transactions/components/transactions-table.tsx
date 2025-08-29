
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
  const { costCenters, transactions } = useAppContext();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [groupedTransactions, setGroupedTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const handleTransactionClick = (tx: Transaction) => {
    setSelectedTransaction(tx);
    if (tx.type === 'entrada' && tx.invoice) {
      const relatedTransactions = transactions.filter(t => t.invoice === tx.invoice && t.type === 'entrada');
      setGroupedTransactions(relatedTransactions);
    } else {
      setGroupedTransactions([tx]);
    }
  };


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
                    <TableRow className="cursor-pointer" onClick={() => handleTransactionClick(tx)}>
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
                  <DialogContent className="sm:max-w-3xl">
                     <DialogHeader>
                        <DialogTitle>Detalhes da Transação</DialogTitle>
                         {selectedTransaction && (
                           <DialogDescription>
                            {selectedTransaction.type === 'entrada' && selectedTransaction.invoice 
                                ? `Itens da Nota Fiscal: ${selectedTransaction.invoice}`
                                : `ID da Transação: ${selectedTransaction.id}`
                            }
                          </DialogDescription>
                         )}
                      </DialogHeader>
                      {selectedTransaction && (
                         <div className="grid gap-4 py-4 text-sm">
                           {groupedTransactions.length > 1 ? (
                            <>
                              <div className="grid grid-cols-3 gap-x-4">
                                <div><span className="font-semibold">Data:</span> {isClient ? format(new Date(selectedTransaction.date), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR }) : ''}</div>
                                <div><span className="font-semibold">Fornecedor:</span> {selectedTransaction.supplier}</div>
                                <div><span className="font-semibold">Responsável:</span> {selectedTransaction.responsible}</div>
                              </div>
                              <ScrollArea className="h-64 w-full rounded-md border">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Material</TableHead>
                                      <TableHead>Qtd.</TableHead>
                                      <TableHead>Vl. Un.</TableHead>
                                      <TableHead>Local</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {groupedTransactions.map(item => (
                                      <TableRow key={item.id}>
                                        <TableCell>
                                          <div>{item.materialName}</div>
                                          <div className="text-xs text-muted-foreground">{item.invoiceName}</div>
                                        </TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell>{item.unitPrice?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? 'N/A'}</TableCell>
                                        <TableCell>{item.stockLocation}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </ScrollArea>
                            </>
                           ) : (
                             <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                               <div><span className="font-semibold">Material Padrão:</span> {selectedTransaction.materialName}</div>
                               {selectedTransaction.type === 'entrada' && selectedTransaction.invoiceName && <div><span className="font-semibold">Nome na Nota:</span> {selectedTransaction.invoiceName}</div>}
                               <div><span className="font-semibold">Tipo:</span> <span className={cn(selectedTransaction.type === 'entrada' ? 'text-emerald-600' : 'text-amber-600')}>{selectedTransaction.type === 'entrada' ? 'Entrada' : 'Saída'}</span></div>
                               <div><span className="font-semibold">Quantidade:</span> {selectedTransaction.quantity}</div>
                               <div><span className="font-semibold">Data:</span> {isClient ? format(new Date(selectedTransaction.date), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR }) : ''}</div>
                               <div><span className="font-semibold">Responsável:</span> {selectedTransaction.responsible}</div>
                               {selectedTransaction.costCenter && <div><span className="font-semibold">Centro de Custo:</span> {costCenters.find(c => c.name === selectedTransaction.costCenter)?.name || selectedTransaction.costCenter}</div>}
                               {selectedTransaction.type === 'entrada' && selectedTransaction.supplier && <div><span className="font-semibold">Fornecedor:</span> {selectedTransaction.supplier}</div>}
                               {selectedTransaction.invoice && <div><span className="font-semibold">Nota Fiscal:</span> {selectedTransaction.invoice}</div>}
                               {selectedTransaction.type === 'saida' && selectedTransaction.osNumber && <div><span className="font-semibold">Nº da OS:</span> {selectedTransaction.osNumber}</div>}
                               {selectedTransaction.stockLocation && <div><span className="font-semibold">Local do Estoque:</span> {selectedTransaction.stockLocation}</div>}
                             </div>
                           )}
                         </div>
                       )}
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
