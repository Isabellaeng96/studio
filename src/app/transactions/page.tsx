"use client";

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TransactionForm } from './components/transaction-form';
import { TransactionsTable } from './components/transactions-table';
import { useAppContext } from '@/context/AppContext';

export default function TransactionsPage() {
  const { materials, transactions, addTransaction } = useAppContext();
  const [activeTab, setActiveTab] = useState('saida');

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transações</h1>
        <p className="text-muted-foreground">
          Registre novas entradas e saídas e visualize o histórico.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="entrada">Entrada</TabsTrigger>
              <TabsTrigger value="saida">Saída</TabsTrigger>
            </TabsList>
            <TabsContent value="entrada">
              <TransactionForm type="entrada" materials={materials} onSave={addTransaction} />
            </TabsContent>
            <TabsContent value="saida">
              <TransactionForm type="saida" materials={materials} onSave={addTransaction} />
            </TabsContent>
          </Tabs>
        </div>
        <div className="lg:col-span-2">
          <TransactionsTable data={transactions} materials={materials} />
        </div>
      </div>
    </div>
  );
}
