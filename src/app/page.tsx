
"use client";

import {
  Activity,
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  Package,
  PlusCircle,
  Archive,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { useAppContext } from '@/context/AppContext';
import { useMemo, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TransactionTypeDialog } from './transactions/components/transaction-type-dialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';


function getRecentTransactions(transactions: Transaction[], limit = 5): Transaction[] {
  return [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

export default function DashboardPage() {
  const { materials, transactions, costCenters } = useAppContext();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const lowStockMaterials = useMemo(() => {
    return materials.filter(material => material.currentStock < material.minStock)
  }, [materials]);

  const recentTransactions = useMemo(() => {
    return getRecentTransactions(transactions, 5)
  }, [transactions]);
  

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Painel</h1>
          <p className="text-muted-foreground">
            Uma visão geral do seu inventário e atividades recentes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TransactionTypeDialog>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova Transação
            </Button>
          </TransactionTypeDialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/materials?filter=low_stock">
            <Card className="bg-destructive/10 border-destructive hover:bg-destructive/20 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-destructive">
                Alertas de Estoque Baixo
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-destructive">
                {lowStockMaterials.length}
                </div>
                <p className="text-xs text-destructive/80">
                itens precisam de reposição.
                </p>
            </CardContent>
            </Card>
        </Link>
        <Link href="/materials">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Materiais</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{materials.length}</div>
              <p className="text-xs text-muted-foreground">
                itens únicos no catálogo.
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/transactions">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Atividade Recente
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {transactions.length}
              </div>
              <p className="text-xs text-muted-foreground">
                transações registradas no total.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="flex flex-col gap-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
             <div>
              <CardTitle>Transações Recentes</CardTitle>
              <CardDescription>
                Um registro dos últimos 5 movimentos de estoque.
              </CardDescription>
            </div>
             <Button size="sm" variant="outline" asChild>
              <Link href="/transactions">
                Ver Todas <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead className="text-center">Tipo</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Responsável</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map(tx => (
                   <Dialog key={tx.id}>
                    <DialogTrigger asChild>
                      <TableRow className="cursor-pointer">
                        <TableCell className="font-medium">{materials.find(m => m.id === tx.materialId)?.name || tx.materialId}</TableCell>
                        <TableCell className="text-center">
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
                        <TableCell>{isClient ? format(new Date(tx.date), 'dd/MM/yyyy') : ''}</TableCell>
                        <TableCell>{tx.responsible}</TableCell>
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
                           {tx.costCenter && <div><span className="font-semibold">Centro de Custo:</span> {costCenters.find(c => c.id === tx.costCenter)?.name || tx.costCenter}</div>}
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Estoque Geral</CardTitle>
              <CardDescription>
                Visão geral do inventário atual.
              </CardDescription>
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link href="/materials">
                Ver Todos <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
             <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead className="text-right">Estoque</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materials.slice(0, 5).map(material => (
                     <TableRow key={material.id}>
                        <TableCell>
                          <p className="font-medium">{material.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Mín: {material.minStock}
                          </p>
                        </TableCell>
                        <TableCell className={cn(
                          "text-right font-mono",
                          material.currentStock < material.minStock ? "text-destructive font-bold" : ""
                        )}>
                          {material.currentStock}
                        </TableCell>
                      </TableRow>
                  ))}
                </TableBody>
              </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
