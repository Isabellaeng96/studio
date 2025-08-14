"use client";

import { useState } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { MaterialSave } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MaterialImporterProps {
  children: React.ReactNode;
  onImport: (materials: MaterialSave[]) => { messages: { variant: "default" | "destructive", title: string, description: string }[] };
}

const requiredHeaders = ['name', 'category', 'unit', 'minStock', 'supplier'];

export function MaterialImporter({ children, onImport }: MaterialImporterProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<MaterialSave[]>([]);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setParsedData([]);
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv') {
        setError('Por favor, selecione um arquivo .csv');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const parseFile = (fileToParse: File) => {
    Papa.parse<any>(fileToParse, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields;
        if (!headers || !requiredHeaders.every(h => headers.includes(h))) {
          setError(`O cabeçalho do CSV deve conter: ${requiredHeaders.join(', ')}`);
          return;
        }

        const materials: MaterialSave[] = results.data.map(row => ({
          name: row.name || '',
          category: row.category || '',
          unit: row.unit || '',
          minStock: Number(row.minStock) || 0,
          supplier: row.supplier || undefined,
        }));
        
        setParsedData(materials.map(m => ({
            ...m, 
            name: m.name.toUpperCase(),
            supplier: m.supplier?.toUpperCase()
        })));
      },
      error: (err) => {
        setError(`Erro ao analisar o arquivo: ${err.message}`);
      }
    });
  };

  const handleImport = () => {
    if (parsedData.length > 0) {
      const { messages } = onImport(parsedData);
      
      messages.forEach(msg => {
          toast({
              variant: msg.variant,
              title: msg.title,
              description: msg.description,
          })
      });
      
      setOpen(false);
      resetState();
    }
  };
  
  const resetState = () => {
    setFile(null);
    setParsedData([]);
    setError('');
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetState();
    }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Importar Materiais de CSV</DialogTitle>
          <DialogDescription>
            Selecione um arquivo CSV para importar múltiplos materiais. O arquivo deve ter as colunas: name, category, unit, minStock, supplier.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <Input type="file" accept=".csv" onChange={handleFileChange} />
            {error && <p className="text-sm text-destructive">{error}</p>}
            {parsedData.length > 0 && (
                <div>
                    <h3 className="mb-2 font-semibold">Pré-visualização dos Dados</h3>
                    <ScrollArea className="h-72 w-full rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Categoria</TableHead>
                                    <TableHead>Unidade</TableHead>
                                    <TableHead>Estoque Mín.</TableHead>
                                    <TableHead>Fornecedor</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {parsedData.map((material, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{material.name}</TableCell>
                                        <TableCell>{material.category}</TableCell>
                                        <TableCell>{material.unit}</TableCell>
                                        <TableCell>{material.minStock}</TableCell>
                                        <TableCell>{material.supplier}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </div>
            )}
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleImport} disabled={parsedData.length === 0 || !!error}>
            Importar {parsedData.length > 0 ? `(${parsedData.length} itens)` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
