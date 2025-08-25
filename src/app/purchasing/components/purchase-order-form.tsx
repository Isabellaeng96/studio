
"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppContext } from "@/context/AppContext";
import { Trash2, FileSpreadsheet, FileText, ChevronDown } from "lucide-react";
import type { PurchaseOrderItem } from "@/types";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

const purchaseOrderSchema = z.object({
  items: z.array(z.object({
    materialId: z.string(),
    quantity: z.coerce.number().min(1, "A quantidade deve ser maior que 0."),
    supplierId: z.string().min(1, "Selecione um fornecedor."),
  })).min(1, "O pedido deve ter pelo menos um item."),
});

type PurchaseOrderFormValues = z.infer<typeof purchaseOrderSchema>;

interface PurchaseOrderFormProps {
  materialIds: string[];
  onCancel: () => void;
  onExport: (items: PurchaseOrderItem[], format: 'pdf' | 'xlsx') => void;
}

export function PurchaseOrderForm({ materialIds, onCancel, onExport }: PurchaseOrderFormProps) {
  const { activeMaterials, suppliers } = useAppContext();

  const materialsInOrder = activeMaterials.filter(m => materialIds.includes(m.id));

  const form = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      items: materialsInOrder.map(m => {
        const defaultSupplier = suppliers.find(s => s.name === m.supplier);
        return {
          materialId: m.id,
          // Suggest ordering enough to reach double the min stock
          quantity: Math.max(1, (m.minStock * 2) - m.currentStock), 
          supplierId: defaultSupplier?.id || '',
        };
      }),
    },
  });

  const { fields, remove, update } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const onSubmit = (data: PurchaseOrderFormValues) => {
    // This is a dummy function, as the action is handled by the export buttons
    console.log("Form data:", data);
  };
  
  const handleExport = (format: 'pdf' | 'xlsx') => {
      const data = form.getValues();
      onExport(data.items, format);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar Pedido de Compra</CardTitle>
        <CardDescription>
          Ajuste as quantidades e selecione os fornecedores para cada material.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-4 rounded-md border p-4">
                {fields.map((field, index) => {
                    const material = materialsInOrder.find(m => m.id === field.materialId);
                    if (!material) return null;
                    
                    return (
                        <div key={field.id} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_2fr_auto] gap-4 items-end p-3 rounded-md border bg-muted/50 relative">
                            <div className="font-medium">
                                <p>{material.name}</p>
                                <p className="text-xs text-muted-foreground">Estoque Atual: {material.currentStock}</p>
                            </div>
                             <FormField
                                control={form.control}
                                name={`items.${index}.quantity`}
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Quantidade</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`items.${index}.supplierId`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fornecedor</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione um fornecedor" />
                                            </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                             />
                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4 text-destructive"/>
                            </Button>
                        </div>
                    )
                })}
            </div>
            {form.formState.errors.items && (
                <p className="text-sm font-medium text-destructive">{form.formState.errors.items.message || form.formState.errors.items.root?.message}</p>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button disabled={!form.formState.isValid}>
                        Exportar Pedido
                        <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleExport('pdf')}>
                        <FileText className="mr-2" />
                        <span>Exportar para .pdf</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('xlsx')}>
                        <FileSpreadsheet className="mr-2" />
                        <span>Exportar para .xlsx</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
             </DropdownMenu>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
