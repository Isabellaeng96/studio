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

// Base64 encoded version of a simplified PNG for PDF embedding
export const logoBase64 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAAAyCAYAAAD2s5rWAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAARKSURBVHhe7d2/ThRREAfwL0gQjQYj8S9I1CgxUeM7MD4KxaM/iEcjEonP4BfQGAkYjRGNRoORWBqJJiBJRJqJ2b1378x+9oOc3FvuzO4um73d3U3W7T4QlyYjJicmJyYnJicmJyYnJicmJyYnJicmJyYnJicmJyYnJicmJyYnJicmJyYnJicmJyYnJicmJyYnJicmJyYnJicmJzZOif2Lfb78p3bH/s6m/wX+f+H/I/sP+b/N/M/938j+z/5f5v8j+x/7P9n/3P+r/D/sf+b/Uv8v8z+x/2f3L/T/M/uf+z+V/a/5f8D83/zP6X/U/Of9/8z+1/x/zP/T/D/M/8H8z+x/0fzv/R/M/9H8z+1/x/zf/R/A/M/9H8L83/0fwPzf/R/C/N/9H8D83/0fzv/R/A/N/NH8z+9/0fzP/R/M/M/9H8z+x/0fzP/R/M/9H8z+x/0fzP/R/M/9H8z+x/0fzP/R/M/9H8z+x/0fzv/R/M/9H8D83/0fzv/R/M/N/NH8z+1/z/zP/B/M/sf9H8z+1/0fzP/R/M/N/NH8z+1/z/zP/B/M/sf9H8z+1/0fzP/R/M/N/NH8z+1/z/zP/B/M/sf9H8z+1/0fzP/R/M/N/NH8z+1/z/zP/B/M/sf9H8z+1/0fzP/R/M/N/NH8z+1/z/zP/B/M/sf9H8z+1/0fzP/R/M/N/NH8z+1/z/zP/B/A/N/8z+x/x/zf/T/D/M/9H8D83/3PzPfR/M/9z8z+x/zf/X/H/N/9n8z/xf5X9n/3fzv/N/d/M/938L83/zP7X/H/M/9/+X+Z/ZP9n/w/zP/N/kv2f/T/M/8n+l/x/zf/L/F/lf2T/Z/M/8n+l/x/zP/Z/N/9H8z+x/x/zP/R/A/N/9H8D83/0fwPzf/R/M/9H8D83/0fwPzf/R/C/N/9H8D83/0fwPzf/R/A/N/9H8z+x/0fzPzR/M/N/NH8z+x/x/zPzR/M/N/9H8z+x/x/zPzR/M/N/9H8z+x/x/zPzR/M/N/9H8z+x/x/zPzR/M/N/9H8z+x/x/zPzR/M/N/9H8z+x/x/zP/B/A/M/sf9H8z+x/wPzP/B/M/sf8f8D83/zP7H/H/A/M/8z+x/x/zP/B/A/M/sf9H8z+x/wPzP/B/M/sf8f8D83/zP7H/H/A/M/8z+x/x/wPzP/B/A/M/sf9H8z+x/wPzP/B/M/sf8f8D83/zP7H/H/A/M/8z+x/x/wPzP/B/A/M/sf9H8z+x/wPzP/B/M/sf8f8D83/zP7H/H/A/M/8z+x/x/wPzP/B/A/M/sf9H8z+x/wPzP/B/A/M/sf8f8D83/3PzPfR/M/N/9H8D83/3PzPfR/M/N/9H8D83/3PzPfR/M/N/9H8D83/3PzPfR/M/N/9H8D83/3PzPfR/M/N/9H8z+yYnJicmJyYnJicmJyYnJicmJyYnJicmJyYnJicmJyYnJicmJyYnJicmJyYnJicmJyYnJicmJyYnJicmJyYnJicmNw/4C2yQ1lD2aPSAAAAAASUVORK5CYII=';
