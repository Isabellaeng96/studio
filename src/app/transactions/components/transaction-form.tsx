"use client";

import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

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
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';

const transactionSchema = z.object({
  materialId: z.string().optional(),
  materialName: z.string().optional(),
  quantity: z.coerce.number().positive('A quantidade deve ser positiva.'),
  date: z.date({ required_error: 'A data é obrigatória.' }),
  responsible: z.string().min(2, 'O responsável é obrigatório.'),
  supplier: z.string().optional().transform(val => val ? val.toUpperCase() : val),
  invoice: z.string().optional(),
  osNumber: z.string().optional(),
  costCenter: z.string().optional(),
  stockLocation: z.string().optional(),
  // Fields for new material creation
  unit: z.string().optional(),
  category: z.string().optional(),
}).refine(data => data.materialId || data.materialName, {
    message: 'Selecione um material ou digite um novo nome.',
    path: ['materialId'],
});


export type TransactionFormValues = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  type: 'entrada' | 'saida';
  materials: Material[];
  costCenters: CostCenter[];
  onSave: (transaction: TransactionSave, type: 'entrada' | 'saida') => boolean;
  defaultMaterialId?: string | null;
  initialValues?: Partial<TransactionFormValues>;
}

export function TransactionForm({ type, materials, costCenters, onSave, defaultMaterialId, initialValues }: TransactionFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date: new Date(),
      responsible: user?.displayName ?? '',
      quantity: 0,
      materialId: defaultMaterialId ?? '',
      materialName: '',
      supplier: '',
      invoice: '',
      osNumber: '',
      costCenter: '',
      stockLocation: '',
       ...initialValues
    },
  });

  useEffect(() => {
    if (defaultMaterialId) {
      form.setValue('materialId', defaultMaterialId);
    }
    form.setValue('responsible', user?.displayName ?? '');
  }, [defaultMaterialId, form, user]);

  useEffect(() => {
    if (initialValues) {
      // Logic to handle pre-filling from PDF extraction or other sources
      const existingMaterial = initialValues.materialName ? materials.find(m => m.name.toUpperCase() === initialValues.materialName?.toUpperCase()) : null;
      if (existingMaterial) {
          initialValues.materialId = existingMaterial.id;
          initialValues.materialName = undefined; // Use ID instead if it already exists
      }
      form.reset({
        date: new Date(),
        responsible: user?.displayName ?? '',
        quantity: initialValues.quantity || 0,
        supplier: initialValues.supplier || '',
        invoice: initialValues.invoice || '',
        materialId: initialValues.materialId,
        materialName: initialValues.materialName,
        unit: initialValues.unit,
        category: initialValues.category,
        osNumber: '',
        costCenter: '',
        stockLocation: '',
      });
    }
  }, [initialValues, form, materials, user]);


  const onSubmit = (data: TransactionFormValues) => {
    if (data.materialId) {
      const selectedMaterial = materials.find(m => m.id === data.materialId);
      data.materialName = selectedMaterial?.name;
      // Clear new material specific fields if an existing one is chosen
      data.unit = undefined;
      data.category = undefined;
    } else if (data.materialName) {
        if (!data.unit) data.unit = 'un'; // Default unit if not provided
        if (!data.category) data.category = 'GERAL'; // Default category
    }
    
    const wasSaved = onSave(data, type);
    if (wasSaved) {
        toast({
            title: 'Transação Registrada',
            description: `Uma nova transação de ${type} de ${data.quantity} unidades foi salva.`,
        });
        form.reset();
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        current.delete('showForm');
        current.delete('materialId');
        current.delete('tab');
        const search = current.toString();
        const query = search ? `?${search}` : '';
        router.push(`${pathname}${query}`);
    }
  };
  
  const handleCancel = () => {
    form.reset({
      date: new Date(),
      responsible: user?.displayName ?? '',
      quantity: 0,
      materialId: '',
      materialName: '',
      supplier: '',
      invoice: '',
      osNumber: '',
      costCenter: '',
      stockLocation: '',
    });
  }
  
  const selectedMaterialId = form.watch('materialId');
  const newMaterialName = form.watch('materialName');

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
                  <Select onValueChange={field.onChange} value={field.value} disabled={!!newMaterialName}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um material existente" />
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
             
             {type === 'entrada' && (
                <>
                <div className="flex items-center gap-4">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="text-xs text-muted-foreground">OU</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>
                 <FormField
                    control={form.control}
                    name="materialName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Novo Material</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite o nome do novo material" {...field} value={field.value ?? ''} disabled={!!selectedMaterialId}/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
            )}

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="0"
                      {...field}
                      onWheel={(e) => (e.target as HTMLElement).blur()}
                    />
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
                          {field.value ? format(field.value, 'dd/MM/yyyy', { locale: ptBR }) : <span>Escolha uma data</span>}
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
                        locale={ptBR}
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

            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="ghost" onClick={handleCancel}>
                    Cancelar
                </Button>
                <Button type="submit">
                    Salvar Transação
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
