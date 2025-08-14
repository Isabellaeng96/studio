"use client";

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface TransactionTypeDialogProps {
  children: React.ReactNode;
}

export function TransactionTypeDialog({ children }: TransactionTypeDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleSelect = (type: 'entrada' | 'saida') => {
    const params = new URLSearchParams();
    params.set('tab', type);
    params.set('showForm', 'true');
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Selecione o Tipo de Transação</DialogTitle>
          <DialogDescription>
            Escolha se você deseja registrar uma entrada ou uma saída de material.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <Button
            variant="outline"
            className="h-24 flex-col gap-2"
            onClick={() => handleSelect('entrada')}
          >
            <ArrowUpCircle className="h-8 w-8 text-emerald-500" />
            <span className="text-lg">Entrada</span>
          </Button>
          <Button
            variant="outline"
            className="h-24 flex-col gap-2"
            onClick={() => handleSelect('saida')}
          >
            <ArrowDownCircle className="h-8 w-8 text-amber-500" />
            <span className="text-lg">Saída</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
