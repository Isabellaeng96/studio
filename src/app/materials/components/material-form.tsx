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
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  category: z.string().min(2, 'Category is required.'),
  unit: z.string().min(1, 'Unit is required.'),
  minStock: z.coerce.number().min(0, 'Minimum stock cannot be negative.'),
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
      title: `Material ${material ? 'Updated' : 'Created'}`,
      description: `The material "${data.name}" has been successfully saved.`,
    });
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{material ? 'Edit Material' : 'Add New Material'}</DialogTitle>
          <DialogDescription>
            {material
              ? 'Update the details of the existing material.'
              : 'Fill in the details for the new material.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Material Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Cimento CP-II" {...field} />
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
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Estrutura" {...field} />
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
                    <FormLabel>Unit</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., saco 25kg" {...field} />
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
                  <FormLabel>Minimum Stock</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 10" {...field} />
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
                  <FormLabel>Default Supplier (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Votorantim" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit">Save Material</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
