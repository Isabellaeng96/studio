
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
import { Button } from '@/components/ui/button';
import { QrCode, Printer } from 'lucide-react';
import QRCode from "react-qr-code";
import { useRef } from 'react';

interface MaterialDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material: Material;
  stockByLocation: Record<string, number>;
}

export function MaterialDetailsDialog({ open, onOpenChange, material, stockByLocation }: MaterialDetailsDialogProps) {
  const hasLocations = Object.keys(stockByLocation).length > 0;
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const qrCodeValue = `
Material: ${material.name}
Código: ${material.id}
Categoria: ${material.category}
Unidade: ${material.unit}
Fornecedor: ${material.supplier || 'N/A'}
  `.trim();
  
  const handlePrint = () => {
    const printElement = qrCodeRef.current;
    if (printElement) {
      const qrCodeSvg = printElement.querySelector("svg");
      if (qrCodeSvg) {
        const svgString = new XMLSerializer().serializeToString(qrCodeSvg);
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write('<html><head><title>QR Code - ' + material.name + '</title>');
          printWindow.document.write('<style>body { font-family: sans-serif; text-align: center; margin-top: 20px; } .qr-container { display: inline-block; padding: 20px; border: 1px solid #ccc; border-radius: 8px; } h3 { margin-bottom: 10px; } </style>');
          printWindow.document.write('</head><body>');
          printWindow.document.write('<div class="qr-container"><h3>' + material.name + '</h3>' + svgString + '<p style="margin-top:10px;">Código: ' + material.id + '</p></div>');
          printWindow.document.write('</body></html>');
          printWindow.document.close();
          printWindow.focus();
          printWindow.print();
          printWindow.close();
        }
      }
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
        <div>
            <DialogHeader>
              <DialogTitle>{material.name}</DialogTitle>
              <DialogDescription>
                Detalhes do material, estoque e código QR.
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
        </div>
        <div className="flex flex-col items-center justify-center bg-accent/50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <QrCode className="h-5 w-5"/> Código QR do Material
            </h3>
            <div className="bg-white p-4 rounded-md shadow-md">
                 <div ref={qrCodeRef}>
                    <QRCode
                        size={256}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        value={qrCodeValue}
                        viewBox={`0 0 256 256`}
                    />
                 </div>
            </div>
             <p className="text-xs text-muted-foreground mt-2 text-center">Contém ID, nome, categoria, unidade e fornecedor.</p>
             <Button onClick={handlePrint} className="mt-6">
                <Printer className="mr-2 h-4 w-4" />
                Imprimir QR Code
             </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
