"use client";

import {
  BarChart3,
  Home,
  Package,
  Replace,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/', label: 'Painel', icon: Home },
  { href: '/materials', label: 'Materiais', icon: Package },
  { href: '/transactions', label: 'Transações', icon: Replace },
  { href: '/analysis', label: 'Análise', icon: BarChart3 },
];

export function AppSidebarNav({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className={cn("grid items-start gap-1 px-4 text-sm font-medium", isMobile && "p-0")}>
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Link key={href} href={href}>
            <Button
              variant={isActive ? 'default' : 'ghost'}
              className="w-full justify-start gap-2"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Button>
          </Link>
        );
      })}
    </nav>
  );
}
