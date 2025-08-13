
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
import type { Supplier } from '@/types';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

const supplierSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.').transform(val => val.toUpperCase()),
  cnpj: z.string().optional(),
  contactName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Por favor, insira um e-mail válido.').optional().or(z.literal('')),
});

type SupplierFormValues = z.infer<typeof supplierSchema>;

interface SupplierFormProps {
  children: React.ReactNode;
  supplier?: Supplier;
  onSave: (data: Omit<Supplier, 'id'> & { id?: string }) => void;
}

export function SupplierForm({ children, supplier, onSave }: SupplierFormProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: '',
      cnpj: '',
      contactName: '',
      phone: '',
      email: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (supplier) {
        form.reset({
          name: supplier.name,
          cnpj: supplier.cnpj || '',
          contactName: supplier.contactName || '',
          phone: supplier.phone || '',
          email: supplier.email || '',
        });
      } else {
        form.reset({
          name: '',
          cnpj: '',
          contactName: '',
          phone: '',
          email: '',
        });
      }
    }
  }, [supplier, form, open]);


  const onSubmit = (data: SupplierFormValues) => {
    onSave({ ...data, id: supplier?.id });
    toast({
      title: `Fornecedor ${supplier ? 'Atualizado' : 'Criado'}`,
      description: `O fornecedor "${data.name}" foi salvo com sucesso.`,
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
          <DialogTitle>{supplier ? 'Editar Fornecedor' : 'Adicionar Novo Fornecedor'}</DialogTitle>
          <DialogDescription>
            {supplier
              ? 'Atualize os detalhes do fornecedor existente.'
              : 'Preencha os detalhes para o novo fornecedor.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Fornecedor</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: Votorantim" {...field} className="uppercase" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="cnpj"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNPJ (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="00.000.000/0000-00" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="contactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Contato (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: João da Silva" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: (11) 99999-9999" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: contato@fornecedor.com.br" {...field} value={field.value ?? ''} />
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
