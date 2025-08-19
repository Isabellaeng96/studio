
"use client";

import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Material, CostCenter, MultiTransactionItemSave } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const multiItemTransactionSchema = z.object({
  items: z.array(z.object({
    materialId: z.string().min(1, "Selecione um material."),
    quantity: z.coerce.number().positive('A quantidade deve ser positiva.'),
  })).min(1, 'Adicione pelo menos um material à lista.'),
  date: z.date({ required_error: 'A data é obrigatória.' }),
  responsible: z.string().min(2, 'O responsável é obrigatório.'),
  osNumber: z.string().min(1, 'O número da OS é obrigatório.').transform(val => val.toUpperCase()),
  costCenter: z.string().optional(),
  stockLocation: z.string().optional().transform(val => val ? val.toUpperCase() : val),
});

type MultiItemFormValues = z.infer<typeof multiItemTransactionSchema>;

interface MultiItemTransactionFormProps {
  materials: Material[];
  costCenters: CostCenter[];
  onSave: (data: { items: MultiTransactionItemSave[] } & Omit<MultiTransactionItemSave, 'materialId' | 'quantity'>) => boolean;
  defaultMaterialId?: string | null;
  initialItems?: MultiTransactionItemSave[];
}

export function MultiItemTransactionForm({ materials, costCenters, onSave, defaultMaterialId, initialItems = [] }: MultiItemTransactionFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const form = useForm<MultiItemFormValues>({
    resolver: zodResolver(multiItemTransactionSchema),
    defaultValues: {
      items: [],
      date: new Date(),
      responsible: user?.displayName ?? '',
      osNumber: '',
      costCenter: '',
      stockLocation: '',
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "items",
  });
  
  useEffect(() => {
    form.reset({
      items: initialItems.length > 0 ? initialItems : (defaultMaterialId ? [{ materialId: defaultMaterialId, quantity: 1 }] : []),
      date: new Date(),
      responsible: user?.displayName ?? '',
      osNumber: '',
      costCenter: '',
      stockLocation: '',
    });
  }, [initialItems, defaultMaterialId, form, user]);


  const onSubmit = (data: MultiItemFormValues) => {
    const wasSaved = onSave(data);
    if (wasSaved) {
      handleCancel(true);
    }
  };
  
  const handleCancel = (shouldResetAll: boolean = false) => {
    form.reset({
      items: [],
      date: new Date(),
      responsible: user?.displayName ?? '',
      osNumber: '',
      costCenter: '',
      stockLocation: '',
    });
     if (shouldResetAll) {
       const params = new URLSearchParams(searchParams.toString());
       params.delete('showForm');
       if(params.has('materialId')) params.delete('materialId');
       router.push(`${pathname}?${params.toString()}`);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Retirada de Múltiplos Materiais</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Itens para Retirada</h3>
              <div className="space-y-4 rounded-md border p-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-[1fr_100px_auto] items-start gap-2">
                    <FormField
                      control={form.control}
                      name={`items.${index}.materialId`}
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um material" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {materials.map(m => (
                                <SelectItem key={m.id} value={m.id} disabled={m.deleted}>
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
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                           <FormControl>
                             <Input type="number" placeholder="Qtd" {...field} />
                           </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                 <Button type="button" variant="outline" size="sm" onClick={() => append({ materialId: '', quantity: 1 })}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Item
                </Button>
                {form.formState.errors.items && (
                    <p className="text-sm font-medium text-destructive">{form.formState.errors.items.message || form.formState.errors.items.root?.message}</p>
                )}
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
                 <FormField
                  control={form.control}
                  name="osNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número da OS</FormLabel>
                      <FormControl>
                        <Input placeholder="OS-98765" {...field} value={field.value ?? ''} className="uppercase" />
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
                      <FormLabel>Local de Estoque (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Almoxarifado Principal, Prateleira A-3" {...field} value={field.value ?? ''} className="uppercase" />
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
                              className={cn('w-full pl-3 text-left font-normal',!field.value && 'text-muted-foreground')}
                            >
                              {field.value ? format(field.value, 'dd/MM/yyyy', { locale: ptBR }) : <span>Escolha uma data</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus locale={ptBR}/>
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
            </div>
            
            <CardFooter className="flex justify-end gap-2 p-0 pt-4">
                <Button type="button" variant="ghost" onClick={() => handleCancel(true)}>
                    Cancelar
                </Button>
                <Button type="submit">
                    Salvar Retirada
                </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
