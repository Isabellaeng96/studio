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

export function Header() {
  const { toast } = useToast();

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
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => toast({ title: "Em breve!", description: "A página de configurações será implementada." })}>
            Configurações
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toast({ title: "Em breve!", description: "O suporte ao usuário será implementado." })}>
            Suporte
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => console.log('Sair clicado')}>
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
