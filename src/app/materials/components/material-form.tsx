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
import type { Material, MaterialSave } from '@/types';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppContext } from '@/context/AppContext';

const materialSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.').transform(val => val.toUpperCase()),
  category: z.string().min(1, 'A categoria é obrigatória.'),
  unit: z.string().min(1, 'A unidade é obrigatória.'),
  minStock: z.coerce.number().min(0, 'O estoque mínimo não pode ser negativo.'),
  supplier: z.string().optional().transform(val => val ? val.toUpperCase() : val),
});

type MaterialFormValues = z.infer<typeof materialSchema>;

interface MaterialFormProps {
  children: React.ReactNode;
  material?: Material;
  onSave: (data: MaterialSave & { id?: string }) => string | null;
  categories: string[];
}

export function MaterialForm({ 
  children, 
  material, 
  onSave, 
  categories,
}: MaterialFormProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      name: '',
      category: '',
      unit: '',
      minStock: 0,
      supplier: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (material) {
        form.reset({
          ...material,
          supplier: material.supplier || '',
        });
      } else {
        form.reset({
          name: '',
          category: '',
          unit: '',
          minStock: 0,
          supplier: '',
        });
      }
    }
  }, [material, form, open]);


  const onSubmit = (data: MaterialFormValues) => {
    const newMaterialId = onSave({ ...data, id: material?.id });
    if(newMaterialId !== null) {
      toast({
        title: `Material ${material ? 'Atualizado' : 'Criado'}`,
        description: `O material "${data.name}" foi salvo com sucesso.`,
      });
      setOpen(false);
      form.reset();
    }
  };
  
  const validCategories = categories.filter(c => c && c.trim() !== '');

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) form.reset();
    }}>
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
                    <Input placeholder="ex: CIMENTO CP-II" {...field} className="uppercase"/>
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
                     <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {validCategories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <Input placeholder="ex: Votorantim" {...field} value={field.value ?? ''} className="uppercase"/>
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
