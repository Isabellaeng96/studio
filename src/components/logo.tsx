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

// Base64 encoded version of a simplified SVG for PDF embedding
export const logoBase64 =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCAyMDAgNTAiPgogIDxzdHlsZT4KICAgIC5pY29uIHsgZmlsbDogIzI1NjNlYiU7IH0KICAgIC50ZXh0IHsgZm9udC1mYW1pbHk6ICdJbnRlcnJlZ3VsYXInLCBhcmlhbCwgc2Fucy1zZXJpZjsgZm9udC1zaXplOiAyOHB4OyBmaWxsOiAjMjU2M2ViOyBmb250LXdlaWdodDogNjAwOyB9CiAgPC9zdHlsZT4KICA8ZyBjbGFzcz0iaWNvbiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTAsIDEwKSBzY2FsZSgxLjUpIj4KICAgIDxwYXRoIGQ9Ik0xOC44NyAxOC44N2ExMCAxMCAwIDAxMCAwWiIvPgogICAgPHBhdGggZD0iTTIuNDIgNy42NGwtMS4zIDEuMyA1LjM3IDUuMzhMMiAxOC44N2ExMCAxMCAwIDAwNS42NiA1LjY2bDMuNTQtMy41NEw2LjUgMDB6Ii8+CiAgPC9nPgoKICA8dGV4dCB4PSI1MCIgeT0iMzUiIGNsYXNzPSJ0ZXh0Ij5HZW9zdG9xdWU8L3RleHQ+Cjwvc3ZnPgo=';
