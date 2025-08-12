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
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAAAyCAYAAAD2s5rWAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAARJSURBVHhe7d3NThxHEAbgN+gV2GzZEa6Ahg7bIeAEuAIOHSoVdATYDh0sXQAHgBLhCOwOCQ6wO05IkeviA4QJ4Fk/+l9s9lq1p9fL9Wz3FhKLyYjJicmJyYnJicmJyYnJicmJyYnJicmJyYnJicmJyYnJicmJyYnJicmJyYnJicmJicmJyYnJicmJyYnJicmJyYm9Q2I/Yp/hKzU6fjJkP+J/nJj/zH5Jz5g+b/M/tl8y/1fzs/f/1v7a88vtT0fMHyzP2L8kpl/ZP8p//5v7Y/t/i//N/uf+z+b77z+zP5v/uv3f+r/V/8/iX3v/XyL7D/u/jJ/d/m/+b/Z/cv/X/h/b/z//V/Mv9//r/m/+f/Y/+v8z+9f2f+H/Yv9n8/33/zP71/d/kf3P/Z/M99/+/zL7X/f/K/uf+/+T/e/6/8n++f3f5P9n/3fzvfd/M/vf9n8r33/zP7l/V/k/3P/p/Ld9/8z+9/3fzvfR/M/tf9X8r30fzP7n/V/O99/8z+9f1f5f9n/6/y3fV/I/vf9n8r31/zP7V/Z/Ld9X8j+1/3fynfV/M/tf9n8t31fyP7X/d/Kd9X8z+1/2fy3fV/I/tf938p31fzP7X/Z/Ld9X8j+1/3fynfV/M/tf9n8t31fyP7X/d/Kd9X8z+1/2fy3fV/I/tf938p31fzP7X/Z/Ld9X8j+9/u/zPff/M/uf9X8730fzP7n/f/K99H8z+5/5f5vvr/mf2v+3+R/c/9n8z33/zP7H/V/e/6v8n++f3f5P9r/q/zffP/M/vX9X+T/c/8n8931fyP7X/Z/Ld9X8z+1/2fy3fV/I/tf938p31fzP7X/Z/Ld9X8z+1/3fynfV/M/tf9n8t31fyP7X/d/Kd9X8z+1/2fy3fV/I/tf938p31fzP7X/Z/Ld9X8j+1/3fynfV/M/tf9n8t31fyP7X/f/K/t/8/+3P7f/d/l/mf3r/5/F/9/8/+3/3/y/7H/9/mf2f/N/N/t/+f+T+j+Zn/D/uf+j+b+Z/b/7v5v/x+Zn5X/w/zP/h/l/+P+T/a/5/5P5P9r/q/n++v+b/a/6v5nvv/nf2v+r/J/9X8b/Y/8381/4f5f5j/g/m/mP/T/D/M/9H8H83/3PzPfR/N/9z8z30fzf/c/M99H83/3PzPfR/N/9z8z30fzf/c/M99H83/3PzPfR/N/9z8z30fzf/c/M99H83/3PzPfR/N/9z8z30fzf/c/M99H83/3PzPfR/N/9z8z30fzf/c/M99H83/3PzPfR/N/9z8z30fzP7JicmJyYnJicmJyYnJicmJyYnJicmJyYnJicmJyYnJicmJyYnJicmJyYnJicmJyYnJicmJyYnJicmJyYnJicmJyY3D/gHy0Fk2YV4lVwAAAABJRU5ErkJggg==';