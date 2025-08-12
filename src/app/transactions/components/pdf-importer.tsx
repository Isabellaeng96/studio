"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileUp, Wand2 } from 'lucide-react';
import type { TransactionSave } from '@/types';
import { extractTransactionFromPdf } from '@/ai/flows/extract-transaction-from-pdf';
// @ts-ignore
import pdf from 'pdf-parse';


interface PdfImporterProps {
  onDataExtracted: (data: Partial<TransactionSave>) => void;
}

export function PdfImporter({ onDataExtracted }: PdfImporterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Por favor, selecione um arquivo .pdf');
        setFile(null);
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleExtract = async () => {
    if (!file) {
      setError('Nenhum arquivo selecionado.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const data = await pdf(arrayBuffer);
      
      const result = await extractTransactionFromPdf({
        pdfTextContent: data.text,
      });

      onDataExtracted(result);

      toast({
        title: 'Dados Extraídos com Sucesso!',
        description: 'O formulário de entrada foi preenchido com os dados do PDF.',
      });

    } catch (err: any) {
      console.error("Erro ao extrair do PDF:", err);
      setError(`Falha ao processar o PDF: ${err.message}`);
      toast({
        variant: "destructive",
        title: "Falha na Extração",
        description: "Não foi possível extrair dados do PDF. Verifique o arquivo e tente novamente.",
      });
    } finally {
      setIsLoading(false);
      setFile(null);
      // Reset the input value
      const input = document.getElementById('pdf-upload') as HTMLInputElement;
      if (input) input.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
           <Wand2 className="h-5 w-5 text-primary"/>
           Importar de PDF
        </CardTitle>
        <CardDescription>
          Faça o upload de uma nota fiscal em PDF para preencher o formulário de entrada automaticamente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
            <Input id="pdf-upload" type="file" accept=".pdf" onChange={handleFileChange} disabled={isLoading} />
            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <Button onClick={handleExtract} disabled={!file || isLoading} className="w-full">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FileUp className="mr-2 h-4 w-4" />
          )}
          {isLoading ? 'Analisando PDF...' : 'Extrair Dados do PDF'}
        </Button>
      </CardContent>
    </Card>
  );
}
