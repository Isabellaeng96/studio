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
import type { Material } from '@/types';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const materialSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  category: z.string().min(2, 'A categoria é obrigatória.'),
  unit: z.string().min(1, 'A unidade é obrigatória.'),
  minStock: z.coerce.number().min(0, 'O estoque mínimo não pode ser negativo.'),
  supplier: z.string().optional(),
});

type MaterialFormValues = z.infer<typeof materialSchema>;

interface MaterialFormProps {
  children: React.ReactNode;
  material?: Material;
}

export function MaterialForm({ children, material }: MaterialFormProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      name: material?.name ?? '',
      category: material?.category ?? '',
      unit: material?.unit ?? '',
      minStock: material?.minStock ?? 0,
      supplier: material?.supplier ?? '',
    },
  });

  const onSubmit = (data: MaterialFormValues) => {
    // In a real app, you'd call a server action or API here.
    toast({
      title: `Material ${material ? 'Atualizado' : 'Criado'}`,
      description: `O material "${data.name}" foi salvo com sucesso.`,
    });
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{material ? 'Editar Material' : 'Adicionar Novo Material'}</DialogTitle>
          <DialogDescription>
            {material
              ? 'Atualize os detalhes do material existente.'
              : 'Preencha os detalhes para o novo material.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Material</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: Cimento CP-II" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: Estrutura" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: saco 25kg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="minStock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estoque Mínimo</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="ex: 10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="supplier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fornecedor Padrão (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: Votorantim" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit">Salvar Material</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
