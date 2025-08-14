// src/app/login/page.tsx
"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';
import { Separator } from '@/components/ui/separator';

function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.021,35.591,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
  )
}

function MicrosoftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
      <path fill="#f35325" d="M22.5,22.5H6.5V6.5h16V22.5z" />
      <path fill="#81bc06" d="M41.5,22.5H25.5V6.5h16V22.5z" />
      <path fill="#05a6f0" d="M22.5,41.5H6.5v-16h16V41.5z" />
      <path fill="#ffba08" d="M41.5,41.5H25.5v-16h16V41.5z" />
    </svg>
  );
}


export default function LoginPage() {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup, loginWithGoogle, loginWithMicrosoft } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isLoginView) {
        await login(email, password);
      } else {
        await signup(email, password, name);
        toast({
          title: "Conta Criada!",
          description: "Sua conta foi criada com sucesso. Faça o login para continuar.",
        });
        setIsLoginView(true); // Switch to login view after successful signup
      }
      router.push('/');
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: isLoginView ? "Falha no Login" : "Falha no Cadastro",
        description: isLoginView ? "Verifique seu e-mail e senha e tente novamente." : error.message,
      });
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleSocialSubmit = async (provider: 'google' | 'microsoft') => {
    setIsLoading(true);
    try {
      if (provider === 'google') {
        await loginWithGoogle();
      } else {
        await loginWithMicrosoft();
      }
      router.push('/');
    } catch (error: any) {
      console.error(error);
      const providerName = provider === 'google' ? 'Google' : 'Microsoft';
      let description = `Não foi possível fazer o login com ${providerName}. Tente novamente.`;
      if (error.code === 'auth/account-exists-with-different-credential') {
        description = `Já existe uma conta com o mesmo e-mail associado a outro método de login.`;
      } else if (error.code) {
        description = `Ocorreu um erro: ${error.code}. Verifique a configuração do provedor no Firebase.`;
      }
      
      toast({
        variant: "destructive",
        title: `Falha no Login com ${providerName}`,
        description,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Logo className="mx-auto" />
          <CardDescription className="pt-2">
             {isLoginView ? 'Acesse seu painel de gerenciamento de estoque' : 'Crie sua conta para começar a gerenciar'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="w-full" onClick={() => handleSocialSubmit('google')} disabled={isLoading}>
                  <GoogleIcon /> Entrar com Google
              </Button>
               <Button variant="outline" className="w-full" onClick={() => handleSocialSubmit('microsoft')} disabled={isLoading}>
                  <MicrosoftIcon /> Entrar com Microsoft
              </Button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                  Ou continue com
                  </span>
              </div>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {!isLoginView && (
                 <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu Nome Completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (isLoginView ? 'Entrando...' : 'Criando...') : (isLoginView ? 'Entrar' : 'Criar Conta')}
              </Button>
            </form>
          </div>
        </CardContent>
        <CardFooter className="justify-center">
           <Button variant="link" onClick={() => setIsLoginView(!isLoginView)}>
             {isLoginView ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
           </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
