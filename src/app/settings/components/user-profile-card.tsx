// src/app/settings/components/user-profile-card.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";


const profileSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
});

type ProfileFormValues = z.infer<typeof profileSchema>;


export function UserProfileCard() {
  const { user, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
        name: user?.displayName || '',
    },
  });
  
  useEffect(() => {
    if (user?.displayName) {
        form.setValue('name', user.displayName);
    }
  }, [user, form]);


  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    try {
      await updateUserProfile(data.name);
      toast({
        title: "Perfil Atualizado!",
        description: "Seu nome foi atualizado com sucesso.",
      });
    } catch (error: any) {
        console.error(error);
        toast({
            variant: "destructive",
            title: "Falha ao Atualizar Perfil",
            description: "Ocorreu um erro ao tentar salvar seu nome.",
        });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil do Usuário</CardTitle>
        <CardDescription>Atualize seu nome e veja suas informações.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24">
                <AvatarImage src="https://placehold.co/100x100" alt="Avatar do Usuário" data-ai-hint="user avatar" />
                <AvatarFallback className="text-3xl">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
                </Avatar>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
             <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Alterações
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
