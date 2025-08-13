
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { Material } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MaterialDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material: Material;
  stockByLocation: Record<string, number>;
}

export function MaterialDetailsDialog({ open, onOpenChange, material, stockByLocation }: MaterialDetailsDialogProps) {
  const hasLocations = Object.keys(stockByLocation).length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{material.name}</DialogTitle>
          <DialogDescription>
            Detalhes do material e estoque por local.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 text-sm">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div><span className="font-semibold">Código:</span> <span className="font-mono">{material.id}</span></div>
            <div><span className="font-semibold">Categoria:</span> <Badge variant="secondary">{material.category}</Badge></div>
            <div><span className="font-semibold">Unidade:</span> {material.unit}</div>
            <div><span className="font-semibold">Fornecedor Padrão:</span> {material.supplier || 'N/A'}</div>
            <div><span className="font-semibold">Estoque Mínimo:</span> <span className="font-mono">{material.minStock}</span></div>
            <div><span className="font-semibold">Estoque Total:</span> <span className="font-mono">{material.currentStock}</span></div>
          </div>
        </div>
        <div>
            <h3 className="font-semibold mb-2">Estoque por Local</h3>
             <ScrollArea className="h-48 w-full rounded-md border">
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Local</TableHead>
                            <TableHead className="text-right">Quantidade</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {hasLocations ? (
                            Object.entries(stockByLocation).map(([location, quantity]) => (
                                <TableRow key={location}>
                                    <TableCell>{location}</TableCell>
                                    <TableCell className="text-right font-mono">{quantity}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={2} className="text-center text-muted-foreground">
                                    Nenhum local de estoque registrado para este item.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
