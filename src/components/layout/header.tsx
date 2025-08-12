// src/components/layout/header.tsx
"use client";

import { Menu, Wrench } from 'lucide-react';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { AppSidebarNav } from './sidebar-nav';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export function Header() {
  const { toast } = useToast();
  const { logout, user, role } = useAuth();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur sm:px-6">
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Alternar Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="sm:max-w-xs">
            <div className="flex h-full flex-col">
              <div className="flex items-center border-b p-4">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                  <Wrench className="h-6 w-6 text-primary" />
                  <span className="">Geostoque</span>
                </Link>
              </div>
              <div className="flex-1 overflow-y-auto">
                <AppSidebarNav isMobile={true} />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex-1">
        {/* Can add breadcrumbs or title here */}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar>
              <AvatarImage src="https://placehold.co/100x100" alt="Avatar do Usuário" data-ai-hint="user avatar" />
              <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user?.displayName || 'Usuário'}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
              {role && (
                 <p className="text-xs leading-none text-muted-foreground pt-1">
                    Função: <span className="font-semibold">{role}</span>
                 </p>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push('/settings')}>
            Configurações
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toast({ title: "Em breve!", description: "O suporte ao usuário será implementado." })}>
            Suporte
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
