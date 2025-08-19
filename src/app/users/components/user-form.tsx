
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AppUser, AppUserSave } from '@/types';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

const roles = ['Administrador', 'Gerente de Estoque', 'Operador de Campo', 'Visitante'] as const;

const userSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  email: z.string().email('Por favor, insira um e-mail válido.'),
  role: z.enum(roles),
  sector: z.string().min(1, 'O setor é obrigatório.'),
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserFormProps {
  children: React.ReactNode;
  user?: AppUser;
  onSave: (data: AppUserSave & { id?: string }) => void;
  availableSectors: string[];
}

export function UserForm({ children, user, onSave, availableSectors }: UserFormProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'Visitante',
      sector: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (user) {
        form.reset({
          name: user.name,
          email: user.email,
          role: user.role,
          sector: user.sector
        });
      } else {
        form.reset({
          name: '',
          email: '',
          role: 'Visitante',
          sector: '',
        });
      }
    }
  }, [user, form, open]);


  const onSubmit = (data: UserFormValues) => {
    onSave({ ...data, id: user?.id });
    toast({
      title: `Usuário ${user ? 'Atualizado' : 'Criado'}`,
      description: `O usuário "${data.name}" foi salvo com sucesso.`,
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{user ? 'Editar Usuário' : 'Adicionar Novo Usuário'}</DialogTitle>
          <DialogDescription>
            {user
              ? 'Atualize os detalhes do usuário existente.'
              : 'Preencha os detalhes para o novo usuário.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: João da Silva" {...field} />
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
                    <Input type="email" placeholder="usuario@geoblue.com.br" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Papel</FormLabel>
                             <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                    <SelectValue placeholder="Selecione um papel" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {roles.map(role => (
                                        <SelectItem key={role} value={role}>{role}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="sector"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Setor</FormLabel>
                             <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                    <SelectValue placeholder="Selecione um setor" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {availableSectors.map(sector => (
                                        <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
