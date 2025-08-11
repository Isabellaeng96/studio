import {
  Activity,
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  PlusCircle,
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
import { materials, transactions } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import type { Material, Transaction } from '@/types';

function getMaterialsBelowMinStock(materials: Material[]): Material[] {
  return materials.filter(material => material.currentStock < material.minStock);
}

function getRecentTransactions(transactions: Transaction[], limit = 5): Transaction[] {
  return transactions
    .sort((a, b) => b.date - a.date)
    .slice(0, limit);
}

export default function DashboardPage() {
  const lowStockMaterials = getMaterialsBelowMinStock(materials);
  const recentTransactions = getRecentTransactions(transactions);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            An overview of your inventory and recent activities.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/transactions">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Transaction
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-destructive/10 border-destructive">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-destructive">
              Low Stock Alerts
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {lowStockMaterials.length}
            </div>
            <p className="text-xs text-destructive/80">
              items need reordering soon.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Materials</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground"><path d="m20.94 18-2.1-4.33a3.52 3.52 0 0 0-6.19.44l-2.1-4.33a3.52 3.52 0 0 0-6.19.44L2.25 18"/><path d="m18.5 4.5 2.5 5"/><path d="M6 9.5 3.5 4.5"/><path d="M12.5 4.5 15 9.5"/></svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{materials.length}</div>
            <p className="text-xs text-muted-foreground">
              unique items in catalog.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Activity
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recentTransactions.length}
            </div>
            <p className="text-xs text-muted-foreground">
              transactions in the last 7 days.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              A log of the latest inventory movements.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead className="text-center">Type</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Responsible</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map(tx => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-medium">{tx.materialName}</TableCell>
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
                          <span>{tx.type === 'entrada' ? 'Entry' : 'Exit'}</span>
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">{tx.quantity}</TableCell>
                    <TableCell>{new Date(tx.date).toLocaleDateString()}</TableCell>
                    <TableCell>{tx.responsible}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low Stock Items</CardTitle>
            <CardDescription>
              These materials are below their minimum stock level.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockMaterials.length > 0 ? (
              <ul className="space-y-4">
                {lowStockMaterials.map(material => (
                  <li key={material.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{material.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Current: {material.currentStock} | Min: {material.minStock}
                      </p>
                    </div>
                    <Button variant="secondary" size="sm" asChild>
                      <Link href="/transactions">Restock</Link>
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8">
                <p>All materials are above minimum stock levels.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
