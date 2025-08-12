"use client";

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { CostCenter } from '@/types';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

const costCenterSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  description: z.string().optional(),
});

type CostCenterFormValues = z.infer<typeof costCenterSchema>;

interface CostCenterFormProps {
  children: React.ReactNode;
  costCenter?: CostCenter;
  onSave: (data: Omit<CostCenter, 'id'> & { id?: string }) => void;
}

export function CostCenterForm({ children, costCenter, onSave }: CostCenterFormProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<CostCenterFormValues>({
    resolver: zodResolver(costCenterSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (costCenter) {
        form.reset({
          name: costCenter.name,
          description: costCenter.description || '',
        });
      } else {
        form.reset({
          name: '',
          description: '',
        });
      }
    }
  }, [costCenter, form, open]);


  const onSubmit = (data: CostCenterFormValues) => {
    onSave({ ...data, id: costCenter?.id });
    toast({
      title: `Centro de Custo ${costCenter ? 'Atualizado' : 'Criado'}`,
      description: `O centro de custo "${data.name}" foi salvo com sucesso.`,
    });
    setOpen(false);
    form.reset();
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) form.reset();
    }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{costCenter ? 'Editar Centro de Custo' : 'Adicionar Novo Centro de Custo'}</DialogTitle>
          <DialogDescription>
            {costCenter
              ? 'Atualize os detalhes do centro de custo existente.'
              : 'Preencha os detalhes para o novo centro de custo.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Centro de Custo</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: Projeto Alpha" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descreva o propósito deste centro de custo" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
