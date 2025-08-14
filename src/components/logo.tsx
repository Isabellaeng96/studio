// src/components/logo.tsx
import { Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
}

export function Logo({ className, iconOnly = false }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2 font-semibold text-primary', className)}>
      <Wrench className="h-6 w-6" />
      {!iconOnly && <span className="text-xl">Geostoque</span>}
    </div>
  );
}
