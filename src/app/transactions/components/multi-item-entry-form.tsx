
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
import type { Material, EntryItem, Supplier } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';


const supplierSchema = z.object({
  name: z.string().optional(),
  cnpj: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
}).optional();

const multiItemEntrySchema = z.object({
  items: z.array(z.object({
    materialId: z.string().optional(),
    materialName: z.string().min(1, "O nome do material é obrigatório."),
    invoiceName: z.string().optional(),
    isNew: z.boolean(),
    quantity: z.coerce.number().positive('A quantidade deve ser positiva.'),
    unitPrice: z.coerce.number().positive('O valor unitário deve ser positivo.'),
    unit: z.string().min(1, "A unidade é obrigatória."),
    category: z.string().min(1, "A categoria é obrigatória."),
  })).min(1, 'Adicione pelo menos um material à lista.'),
  date: z.date({ required_error: 'A data é obrigatória.' }),
  responsible: z.string().min(2, 'O responsável é obrigatório.'),
  supplier: supplierSchema,
  invoice: z.string().optional(),
  costCenter: z.string().optional(),
  stockLocation: z.string().optional().transform(val => val ? val.toUpperCase() : val),
});

type MultiItemEntryFormValues = z.infer<typeof multiItemEntrySchema>;

interface MultiItemEntryFormProps {
  materials: Material[];
  categories: string[];
  onSave: (data: MultiItemEntryFormValues) => boolean;
  onCancel: (shouldReset: boolean) => void;
  initialItems?: EntryItem[];
  initialInvoice?: string;
  initialSupplier?: Omit<Supplier, 'id'>;
}

export function MultiItemEntryForm({ materials, categories, onSave, onCancel, initialItems, initialInvoice, initialSupplier }: MultiItemEntryFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<MultiItemEntryFormValues>({
    resolver: zodResolver(multiItemEntrySchema),
    defaultValues: {
      items: initialItems && initialItems.length > 0 ? initialItems : [],
      date: new Date(),
      responsible: user?.displayName ?? '',
      supplier: initialSupplier ?? { name: '' },
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
  
  useEffect(() => {
    // For existing items, if invoiceName is empty, default it to the material's name
    fields.forEach((field, index) => {
        if (!field.isNew && field.materialId && !field.invoiceName) {
            const material = materials.find(m => m.id === field.materialId);
            if (material) {
                update(index, { ...field, invoiceName: material.name });
            }
        }
    });
  }, [fields, materials, update]);


  const onSubmit = (data: MultiItemEntryFormValues) => {
    // For new items, ensure invoiceName is the same as materialName
    const processedData = {
        ...data,
        items: data.items.map(item => item.isNew ? { ...item, invoiceName: item.materialName } : item),
    };
    const wasSaved = onSave(processedData);
    if (wasSaved) {
      handleCancel(true);
    }
  };
  
  const handleCancel = (shouldResetAll: boolean = false) => {
    if (shouldResetAll) {
       onCancel(true);
    }
    form.reset({
      items: [],
      date: new Date(),
      responsible: user?.displayName ?? '',
      supplier: { name: '' },
      invoice: '',
      costCenter: '',
      stockLocation: '',
    });
  }

  const handleMaterialSelection = (index: number, materialId: string) => {
    const selectedMaterial = materials.find(m => m.id === materialId);
    if (selectedMaterial) {
      update(index, {
        ...fields[index],
        materialId: selectedMaterial.id,
        materialName: selectedMaterial.name,
        // Preserve existing invoiceName, only default if it's empty
        invoiceName: fields[index].invoiceName || selectedMaterial.name, 
        unit: selectedMaterial.unit,
        category: selectedMaterial.category,
        isNew: false,
      });
    }
  }
  
  const handleIsNewToggle = (index: number, isNew: boolean) => {
    if (isNew) {
        // When toggling to a NEW item, use the invoiceName as the default materialName
        update(index, {
            ...fields[index],
            materialId: undefined,
            materialName: fields[index].invoiceName || '',
            isNew: true,
        })
    } else {
        // When toggling to an EXISTING item, clear the fields to force selection
        update(index, {
            ...fields[index],
            materialId: '',
            materialName: '',
            isNew: false,
        })
    }
  }
  
  const validCategories = categories.filter(c => c && c.trim() !== '');
  const defaultNewItem = { materialId: '', materialName: '', invoiceName: '', isNew: true, quantity: 0, unitPrice: 0, unit: 'un', category: 'GERAL' };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Entrada de Múltiplos Materiais</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Itens de entrada</h3>
              <div className="space-y-4 rounded-md border p-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="space-y-3 p-3 rounded-md border bg-muted/50 relative">
                     <div className="absolute top-2 right-2 flex items-center gap-2">
                        <FormField
                          control={form.control}
                          name={`items.${index}.isNew`}
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-2 space-y-0">
                               <FormLabel className="text-xs">Novo?</FormLabel>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={(checked) => {
                                    field.onChange(checked);
                                    handleIsNewToggle(index, checked);
                                }} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="h-6 w-6 hover:bg-destructive/20">
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
                                    <FormControl><Input {...field} placeholder="Ex: TUBO PVC 100MM (conforme nota)" className="uppercase"/></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ) : (
                       <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name={`items.${index}.materialId`}
                            render={({ field: selectField }) => (
                                <FormItem>
                                <FormLabel>Material (Padrão do Sistema)</FormLabel>
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
                            name={`items.${index}.invoiceName`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome na Nota Fiscal (Opcional)</FormLabel>
                                    <FormControl><Input {...field} placeholder="Nome como veio na nota" className="uppercase"/></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                       </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <FormField
                            control={form.control}
                            name={`items.${index}.quantity`}
                            render={({ field }) => (
                                <FormItem><FormLabel>Quantidade</FormLabel><FormControl><Input type="number" placeholder="Qtd" {...field} /></FormControl><FormMessage /></FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name={`items.${index}.unitPrice`}
                            render={({ field }) => (
                                <FormItem><FormLabel>Valor Unit. (R$)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`items.${index}.unit`}
                            render={({ field }) => (
                                <FormItem><FormLabel>Unidade</FormLabel><FormControl><Input placeholder="Ex: un, kg, m" {...field} disabled={!form.getValues(`items.${index}.isNew`)} /></FormControl><FormMessage /></FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name={`items.${index}.category`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Categoria</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} disabled={!form.getValues(`items.${index}.isNew`)} >
                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {validCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                  </div>
                ))}
                 <Button type="button" variant="outline" size="sm" onClick={() => append(defaultNewItem)}>
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
                  name="supplier.name"
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
                  name="costCenter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Centro de Custo (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Projeto B" {...field} value={field.value ?? ''} />
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
                <Button type="button" variant="ghost" onClick={() => handleCancel()}>
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
