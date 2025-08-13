
"use client";

import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Material, TransactionSave, CostCenter } from '@/types';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';

const transactionSchema = z.object({
  materialId: z.string().min(1, 'Por favor, selecione um material.'),
  quantity: z.coerce.number().positive('A quantidade deve ser positiva.'),
  date: z.date({ required_error: 'A data é obrigatória.' }),
  responsible: z.string().min(2, 'O responsável é obrigatório.'),
  supplier: z.string().optional().transform(val => val ? val.toUpperCase() : val),
  invoice: z.string().optional(),
  osNumber: z.string().optional(),
  workFront: z.string().optional(),
  costCenter: z.string().optional(),
  stockLocation: z.string().optional(),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  type: 'entrada' | 'saida';
  materials: Material[];
  costCenters: CostCenter[];
  onSave: (transaction: TransactionSave, type: 'entrada' | 'saida') => void;
  defaultMaterialId?: string | null;
  initialValues?: Partial<TransactionFormValues>;
}

export function TransactionForm({ type, materials, costCenters, onSave, defaultMaterialId, initialValues }: TransactionFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date: new Date(),
      responsible: user?.displayName ?? '',
      quantity: 0,
      materialId: defaultMaterialId ?? '',
      supplier: '',
      invoice: '',
      osNumber: '',
      workFront: '',
      costCenter: '',
      stockLocation: '',
       ...initialValues
    },
  });

  useEffect(() => {
    if (defaultMaterialId) {
      form.setValue('materialId', defaultMaterialId);
    }
    // Set responsible user when form is re-initialized
    form.setValue('responsible', user?.displayName ?? '');
  }, [defaultMaterialId, form, user]);

  useEffect(() => {
    if (initialValues) {
      // Try to find a matching material
      if (initialValues.materialName) {
        const foundMaterial = materials.find(m => m.name.toLowerCase().includes(initialValues.materialName!.toLowerCase()));
        if (foundMaterial) {
          initialValues.materialId = foundMaterial.id;
        }
      }
      form.reset({
        date: new Date(),
        responsible: user?.displayName ?? '',
        quantity: 0,
        materialId: defaultMaterialId ?? '',
        supplier: '',
        invoice: '',
        osNumber: '',
        workFront: '',
        costCenter: '',
        stockLocation: '',
        ...initialValues,
      });
    }
  }, [initialValues, form, materials, defaultMaterialId, user]);

  const onSubmit = (data: TransactionFormValues) => {
    onSave(data, type);
    toast({
      title: 'Transação Registrada',
      description: `Uma nova transação de ${type} de ${data.quantity} unidades foi salva.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar {type === 'entrada' ? 'Entrada' : 'Saída'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="materialId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Material</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um material" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {materials.map(m => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}
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
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {type === 'entrada' ? (
              <FormField
                control={form.control}
                name="supplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fornecedor</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do fornecedor" {...field} value={field.value ?? ''} className="uppercase"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="osNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número da OS (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="OS-98765" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="workFront"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frente de Trabalho (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="ex: Poço P-03" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="invoice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nota Fiscal (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="NF-12345" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="costCenter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Centro de Custo (Opcional)</FormLabel>
                   <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um centro de custo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                       {costCenters.map(cc => (
                        <SelectItem key={cc.id} value={cc.name}>
                          {cc.name}
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
              name="stockLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Local do Estoque (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: Prateleira A-10" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? format(field.value, 'PPP') : <span>Escolha uma data</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="responsible"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsável</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: João Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Salvar Transação
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
