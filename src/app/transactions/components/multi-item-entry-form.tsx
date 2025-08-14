
"use client";

import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Material, EntryItem, CostCenter } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';
import { Switch } from '@/components/ui/switch';


const multiItemEntrySchema = z.object({
  items: z.array(z.object({
    materialId: z.string().optional(),
    materialName: z.string().min(1, "O nome do material é obrigatório."),
    isNew: z.boolean(),
    quantity: z.coerce.number().positive('A quantidade deve ser positiva.'),
    unit: z.string().min(1, "A unidade é obrigatória."),
    category: z.string().min(1, "A categoria é obrigatória."),
  })).min(1, 'Adicione pelo menos um material à lista.'),
  date: z.date({ required_error: 'A data é obrigatória.' }),
  responsible: z.string().min(2, 'O responsável é obrigatório.'),
  supplier: z.string().optional().transform(val => val ? val.toUpperCase() : val),
  invoice: z.string().optional(),
  costCenter: z.string().optional(),
  stockLocation: z.string().optional(),
});

type MultiItemEntryFormValues = z.infer<typeof multiItemEntrySchema>;

interface MultiItemEntryFormProps {
  materials: Material[];
  categories: string[];
  onSave: (data: MultiItemEntryFormValues) => boolean;
  initialItems?: EntryItem[];
  initialInvoice?: string;
  initialSupplier?: string;
}

export function MultiItemEntryForm({ materials, categories, onSave, initialItems, initialInvoice, initialSupplier }: MultiItemEntryFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const form = useForm<MultiItemEntryFormValues>({
    resolver: zodResolver(multiItemEntrySchema),
    defaultValues: {
      items: initialItems && initialItems.length > 0 ? initialItems : [],
      date: new Date(),
      responsible: user?.displayName ?? '',
      supplier: initialSupplier ?? '',
      invoice: initialInvoice ?? '',
      costCenter: '',
      stockLocation: ''
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "items",
  });
  
  useEffect(() => {
    form.setValue('responsible', user?.displayName ?? '');
  }, [form, user]);

  const onSubmit = (data: MultiItemEntryFormValues) => {
    const wasSaved = onSave(data);
    if (wasSaved) {
      form.reset();
      handleCancel();
    }
  };
  
  const handleCancel = () => {
    form.reset({
      items: [],
      date: new Date(),
      responsible: user?.displayName ?? '',
    });
     const current = new URLSearchParams(Array.from(searchParams.entries()));
      current.delete('showForm');
      current.delete('materialId');
      current.delete('tab');
      const search = current.toString();
      const query = search ? `?${search}` : '';
      router.push(`${pathname}${query}`);
  }

  const handleMaterialSelection = (index: number, materialId: string) => {
    const selectedMaterial = materials.find(m => m.id === materialId);
    if (selectedMaterial) {
      update(index, {
        ...fields[index],
        materialId: selectedMaterial.id,
        materialName: selectedMaterial.name,
        unit: selectedMaterial.unit,
        category: selectedMaterial.category,
        isNew: false,
      });
    }
  }
  
  const handleIsNewToggle = (index: number, isNew: boolean) => {
    if (isNew) {
        update(index, {
            ...fields[index],
            materialId: undefined,
            isNew: true,
        })
    } else {
        update(index, {
            ...fields[index],
            materialId: '',
            isNew: false,
        })
    }
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Entrada de Múltiplos Materiais</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Itens da Nota</h3>
              <div className="space-y-4 rounded-md border p-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="space-y-3 p-3 rounded-md border bg-muted/50">
                    <div className="flex justify-between items-center">
                        <FormField
                          control={form.control}
                          name={`items.${index}.isNew`}
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-2 space-y-0">
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={(checked) => {
                                    field.onChange(checked);
                                    handleIsNewToggle(index, checked);
                                }} />
                              </FormControl>
                              <FormLabel>Novo Material?</FormLabel>
                            </FormItem>
                          )}
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="hover:bg-destructive/20">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>

                    {field.isNew ? (
                        <FormField
                          control={form.control}
                          name={`items.${index}.materialName`}
                          render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nome do Novo Material</FormLabel>
                                <FormControl><Input {...field} placeholder="Ex: CIMENTO ABC" className="uppercase"/></FormControl>
                                <FormMessage />
                            </FormItem>
                          )}
                        />
                    ) : (
                        <FormField
                            control={form.control}
                            name={`items.${index}.materialId`}
                            render={({ field: selectField }) => (
                                <FormItem>
                                <FormLabel>Material Existente</FormLabel>
                                <Select onValueChange={(value) => {
                                    selectField.onChange(value);
                                    handleMaterialSelection(index, value);
                                }} defaultValue={selectField.value}>
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
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        <FormField
                            control={form.control}
                            name={`items.${index}.quantity`}
                            render={({ field }) => (
                                <FormItem><FormLabel>Quantidade</FormLabel><FormControl><Input type="number" placeholder="Qtd" {...field} /></FormControl><FormMessage /></FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`items.${index}.unit`}
                            render={({ field }) => (
                                <FormItem><FormLabel>Unidade</FormLabel><FormControl><Input placeholder="Ex: un, kg, m" {...field} disabled={!field.value && !form.getValues(`items.${index}.isNew`)} /></FormControl><FormMessage /></FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name={`items.${index}.category`}
                            render={({ field }) => (
                                <FormItem className="col-span-2 md:col-span-1">
                                <FormLabel>Categoria</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} disabled={!field.value && !form.getValues(`items.${index}.isNew`)} >
                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                  </div>
                ))}
                 <Button type="button" variant="outline" size="sm" onClick={() => append({ materialId: '', materialName: '', isNew: true, quantity: 0, unit: 'un', category: 'GERAL' })}>
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
                <Button type="button" variant="ghost" onClick={handleCancel}>
                    Cancelar
                </Button>
                <Button type="submit">
                    Salvar Entrada
                </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
