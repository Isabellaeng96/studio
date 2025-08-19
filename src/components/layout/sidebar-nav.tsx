
"use client";

import {
  BarChart3,
  Home,
  Package,
  Replace,
  Landmark,
  Settings,
  Truck,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { href: '/', label: 'Painel', icon: Home, roles: ['Administrador', 'Gerente de Estoque', 'Operador de Campo', 'Visitante'] },
  { href: '/materials', label: 'Materiais', icon: Package, roles: ['Administrador', 'Gerente de Estoque', 'Operador de Campo'] },
  { href: '/transactions', label: 'Transações', icon: Replace, roles: ['Administrador', 'Gerente de Estoque', 'Operador de Campo'] },
  { href: '/suppliers', label: 'Fornecedores', icon: Truck, roles: ['Administrador', 'Gerente de Estoque'] },
  { href: '/cost-centers', label: 'Centros de Custo', icon: Landmark, roles: ['Administrador', 'Gerente de Estoque'] },
  { href: '/analysis', label: 'Análise', icon: BarChart3, roles: ['Administrador'] },
  { href: '/settings', label: 'Configurações', icon: Settings, roles: ['Administrador'] },
];

interface AppSidebarNavProps {
  isMobile?: boolean;
  onLinkClick?: () => void;
}

export function AppSidebarNav({ isMobile = false, onLinkClick }: AppSidebarNavProps) {
  const pathname = usePathname();
  const { role } = useAuth();

  const handleClick = () => {
    if (onLinkClick) {
      onLinkClick();
    }
  };

  return (
    <nav className={cn("grid items-start gap-1 px-4 text-sm font-medium", isMobile && "p-0")}>
      {navItems.map(({ href, label, icon: Icon, roles }) => {
        if (!role || !roles.includes(role)) {
          return null;
        }

        const isActive = pathname === href || (href.length > 1 && pathname.startsWith(href) && href !== '/');
        const isDashboardActive = pathname === '/' && href === '/';
        
        return (
          <Link key={href} href={href} onClick={handleClick}>
            <Button
              variant={(isActive || isDashboardActive) ? 'default' : 'ghost'}
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
