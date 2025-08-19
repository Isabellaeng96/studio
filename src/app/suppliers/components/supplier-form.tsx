
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
import { ScrollArea } from '@/components/ui/scroll-area';

const supplierSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.').transform(val => val.toUpperCase()),
  cnpj: z.string().optional(),
  contactName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Por favor, insira um e-mail válido.').optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  website: z.string().url('Por favor, insira uma URL válida.').optional().or(z.literal('')),
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
      address: '',
      city: '',
      state: '',
      website: '',
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
          address: supplier.address || '',
          city: supplier.city || '',
          state: supplier.state || '',
          website: supplier.website || '',
        });
      } else {
        form.reset({
          name: '',
          cnpj: '',
          contactName: '',
          phone: '',
          email: '',
          address: '',
          city: '',
          state: '',
          website: '',
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{supplier ? 'Editar Fornecedor' : 'Adicionar Novo Fornecedor'}</DialogTitle>
          <DialogDescription>
            {supplier
              ? 'Atualize os detalhes do fornecedor existente.'
              : 'Preencha os detalhes para o novo fornecedor.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="h-96 w-full">
              <div className="space-y-4 py-4 px-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Fornecedor</FormLabel>
                      <FormControl>
                        <Input placeholder="ex: VOTORANTIM" {...field} className="uppercase" />
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
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                            <Input placeholder="(11) 99999-9999" {...field} value={field.value ?? ''} />
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
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input placeholder="contato@fornecedor.com.br" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                 <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Rua, Número, Bairro" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <div className="grid grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                            <Input placeholder="São Paulo" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <FormControl>
                            <Input placeholder="SP" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                 </div>
                 <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://fornecedor.com.br" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>
            <DialogFooter className="px-6 pb-4 pt-4 sm:justify-end">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
