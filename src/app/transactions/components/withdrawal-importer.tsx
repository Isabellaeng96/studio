
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
import type { Material, MultiTransactionItemSave } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload } from 'lucide-react';

interface WithdrawalImporterProps {
  onDataExtracted: (data: MultiTransactionItemSave[]) => void;
  materials: Material[];
}

const requiredHeaders = ['materialId', 'quantity'];

export function WithdrawalImporter({ onDataExtracted, materials }: WithdrawalImporterProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<MultiTransactionItemSave[]>([]);
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

        const items: MultiTransactionItemSave[] = results.data
            .map(row => ({
                materialId: row.materialId,
                quantity: Number(row.quantity) || 0,
            }))
            .filter(item => materials.some(m => m.id === item.materialId) && item.quantity > 0);
        
        const invalidItems = results.data.length - items.length;
        if (invalidItems > 0) {
            toast({
                variant: 'destructive',
                title: 'Itens Inválidos Ignorados',
                description: `${invalidItems} itens foram ignorados por terem um ID de material inválido ou quantidade zero.`,
            });
        }
        
        setParsedData(items);
      },
      error: (err) => {
        setError(`Erro ao analisar o arquivo: ${err.message}`);
      }
    });
  };

  const handleImport = () => {
    if (parsedData.length > 0) {
      onDataExtracted(parsedData);
      toast({
        title: 'Itens Carregados',
        description: `${parsedData.length} itens foram carregados no formulário.`,
      });
      setOpen(false);
      resetState();
    }
  };
  
  const resetState = () => {
    setFile(null);
    setParsedData([]);
    setError('');
    const input = document.getElementById('csv-upload') as HTMLInputElement;
    if (input) input.value = '';
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetState();
    }}>
        <Card className="h-full">
             <CardHeader>
                <CardTitle className="flex items-center gap-2">
                   <Upload className="h-5 w-5 text-primary"/>
                   Importar de CSV
                </CardTitle>
                <CardDescription>
                  Faça o upload de uma planilha CSV para registrar a retirada de múltiplos materiais.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DialogTrigger asChild>
                    <Button className="w-full">Importar Planilha</Button>
                </DialogTrigger>
              </CardContent>
        </Card>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Importar Retirada de Materiais de CSV</DialogTitle>
          <DialogDescription>
            Selecione um arquivo CSV para importar. O arquivo deve ter as colunas: {requiredHeaders.join(', ')}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <Input id="csv-upload" type="file" accept=".csv" onChange={handleFileChange} />
            {error && <p className="text-sm text-destructive">{error}</p>}
            {parsedData.length > 0 && (
                <div>
                    <h3 className="mb-2 font-semibold">Pré-visualização dos Itens</h3>
                    <ScrollArea className="h-72 w-full rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID do Material</TableHead>
                                    <TableHead>Nome do Material</TableHead>
                                    <TableHead>Quantidade</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {parsedData.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{item.materialId}</TableCell>
                                        <TableCell>{materials.find(m => m.id === item.materialId)?.name}</TableCell>
                                        <TableCell>{item.quantity}</TableCell>
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
            Carregar {parsedData.length > 0 ? `(${parsedData.length} itens)` : ''} no Formulário
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
