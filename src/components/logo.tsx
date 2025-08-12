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
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCAyMDAgNTAiPgogIDxzdHlsZT4KICAgIC5pY29uIHsgZmlsbDogIzI1NjNlYjsgfQogICAgLnRleHQgeyBmb250LWZhbWlseTogJ0ludGVycmVndWxhcicsIGFyaWFsLCBzYW5zLXNlcmlmOyBmb250LXNpemU6IDI4cHg7IGZpbGw6ICMyNTYzZWI7IGZvbnQtd2VpZ2h0OiA2MDA7IH0KICA8L3N0eWxlPgogIDxnIGNsYXNzPSJpY29uIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMCwgMTApIHNjYWxlKDEuNSkiPgogICAgPHBhdGggZD0iTTE4Ljg3IDE4Ljg3YTEwIDEwIDAgMDEgMCAwWiIvPgogICAgPHBhdGggZD0iTTIuNDIgNy42NGwtMS4zIDEuMyA1LjM3IDUuMzhMMiAxOC44N2ExMCAxMCAwIDAwNS42NiA1LjY2bDMuNTQtMy41NEw2LjUgMDB6Ii8+CiAgPC9nPgoKICA8dGV4dCB4PSI1MCIgeT0iMzUiIGNsYXNzPSJ0ZXh0Ij5HZW9zdG9xdWU8L3RleHQ+Cjwvc3ZnPgo=';
