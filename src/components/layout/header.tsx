// src/components/layout/header.tsx
"use client";

import { Menu } from 'lucide-react';
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
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Logo } from '../logo';

export function Header() {
  const { logout, user } = useAuth();
  const router = useRouter();

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      const names = name.split(' ').filter(Boolean);
      if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      if (names.length === 1) {
        return names[0][0].toUpperCase();
      }
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return 'U';
  };
  
  const handleSupportClick = () => {
    window.location.href = "mailto:tec08@geoblue.com.br?subject=Suporte Geostoque";
  }


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
                  <Logo />
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
              <AvatarImage src={user?.photoURL ?? undefined} alt="Avatar do Usuário" />
              <AvatarFallback>{getInitials(user?.displayName, user?.email)}</AvatarFallback>
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
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push('/settings')}>
            Configurações
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSupportClick}>
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
