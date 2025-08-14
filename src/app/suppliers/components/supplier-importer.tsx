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
import type { Supplier } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

type SupplierSave = Omit<Supplier, 'id'>;

interface SupplierImporterProps {
  children: React.ReactNode;
  onImport: (suppliers: SupplierSave[]) => { messages: { variant: "default" | "destructive", title: string, description: string }[] };
}

const requiredHeaders = ['name', 'cnpj', 'contactName', 'phone', 'email', 'address', 'city', 'state', 'website'];

export function SupplierImporter({ children, onImport }: SupplierImporterProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<SupplierSave[]>([]);
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
          setError(`O cabeçalho do CSV deve conter: ${requiredHeaders.join(', ')}. Os campos opcionais podem ficar vazios.`);
          return;
        }

        const suppliers: SupplierSave[] = results.data.map(row => ({
          name: row.name || '',
          cnpj: row.cnpj || undefined,
          contactName: row.contactName || undefined,
          phone: row.phone || undefined,
          email: row.email || undefined,
          address: row.address || undefined,
          city: row.city || undefined,
          state: row.state || undefined,
          website: row.website || undefined,
        }));
        
        setParsedData(suppliers.map(s => ({
            ...s, 
            name: s.name.toUpperCase(),
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
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Importar Fornecedores de CSV</DialogTitle>
          <DialogDescription>
            Selecione um arquivo CSV para importar múltiplos fornecedores. O arquivo deve ter as colunas: {requiredHeaders.join(', ')}.
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
                                    <TableHead>CNPJ</TableHead>
                                    <TableHead>Contato</TableHead>
                                    <TableHead>Telefone</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Endereço</TableHead>
                                    <TableHead>Website</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {parsedData.map((supplier, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{supplier.name}</TableCell>
                                        <TableCell>{supplier.cnpj}</TableCell>
                                        <TableCell>{supplier.contactName}</TableCell>
                                        <TableCell>{supplier.phone}</TableCell>
                                        <TableCell>{supplier.email}</TableCell>
                                        <TableCell>{`${supplier.address || ''}, ${supplier.city || ''} - ${supplier.state || ''}`}</TableCell>
                                        <TableCell>{supplier.website}</TableCell>
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
