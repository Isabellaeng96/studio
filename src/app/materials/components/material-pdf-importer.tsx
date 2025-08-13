"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2 } from 'lucide-react';
import type { MaterialSave } from '@/types';
import { extractMaterialFromPdf } from '@/ai/flows/extract-material-from-pdf';

interface MaterialPdfImporterProps {
  onDataExtracted: (data: Partial<MaterialSave>) => void;
}

export function MaterialPdfImporter({ onDataExtracted }: MaterialPdfImporterProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        variant: "destructive",
        title: "Arquivo Inválido",
        description: "Por favor, selecione um arquivo .pdf",
      });
      return;
    }

    setIsLoading(true);

    try {
      const dataUri = await fileToDataUri(file);
      const result = await extractMaterialFromPdf({ pdfDataUri: dataUri });
      
      onDataExtracted(result);

      toast({
        title: 'Dados Extraídos!',
        description: 'O formulário foi pré-preenchido com os dados do PDF.',
      });

    } catch (err: any) {
      console.error("Erro ao extrair do PDF:", err);
      toast({
        variant: "destructive",
        title: "Falha na Extração",
        description: "Não foi possível extrair dados do PDF.",
      });
    } finally {
      setIsLoading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  return (
    <>
      <Button asChild variant="outline">
        <label htmlFor="pdf-material-upload">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          Importar de PDF
          <Input
            id="pdf-material-upload"
            type="file"
            accept=".pdf"
            className="sr-only"
            onChange={handleFileChange}
            disabled={isLoading}
          />
        </label>
      </Button>
    </>
  );
}
