'use server';
/**
 * @fileOverview Extrai informações de transação de um documento PDF.
 *
 * - extractTransactionFromPdf - Analisa um arquivo PDF para extrair detalhes da transação.
 * - TransactionExtractionInput - O tipo de entrada para a função extractTransactionFromPdf.
 * - TransactionExtractionOutput - O tipo de retorno para a função extractTransactionFromPdf.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
// import pdf from 'pdf-parse'; // Will be dynamically imported

const TransactionExtractionInputSchema = z.object({
  pdfDataUri: z.string().describe("O arquivo PDF como um data URI, que deve incluir um MIME type e usar codificação Base64. Formato esperado: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type TransactionExtractionInput = z.infer<typeof TransactionExtractionInputSchema>;

const TransactionExtractionOutputSchema = z.object({
  materialName: z.string().optional().describe('O nome do material ou produto principal encontrado.'),
  quantity: z.number().optional().describe('A quantidade do material.'),
  supplier: z.string().optional().describe('O nome do fornecedor ou da empresa que emitiu o documento.'),
  invoice: z.string().optional().describe('O número da nota fiscal ou fatura, se encontrado.'),
});
export type TransactionExtractionOutput = z.infer<typeof TransactionExtractionOutputSchema>;


export async function extractTransactionFromPdf(input: TransactionExtractionInput): Promise<TransactionExtractionOutput> {
  return extractTransactionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractTransactionPrompt',
  input: { schema: z.object({ pdfTextContent: z.string() }) },
  output: { schema: TransactionExtractionOutputSchema },
  prompt: `Você é um assistente de entrada de dados especializado em analisar texto de notas fiscais e faturas.
Analise o seguinte texto extraído de um PDF e identifique os seguintes campos: nome do material, quantidade, fornecedor e número da nota fiscal.

Se um campo não for encontrado, deixe-o em branco. Foque em extrair os valores exatos. Para o nome do material, procure por uma descrição de produto.

Texto do PDF:
{{{pdfTextContent}}}

Retorne os dados extraídos no formato JSON.
`,
});

const extractTransactionFlow = ai.defineFlow(
  {
    name: 'extractTransactionFlow',
    inputSchema: TransactionExtractionInputSchema,
    outputSchema: TransactionExtractionOutputSchema,
  },
  async input => {
    const pdf = (await import('pdf-parse')).default;
    const base64Data = input.pdfDataUri.split(',')[1];
    const pdfBuffer = Buffer.from(base64Data, 'base64');
    
    const data = await pdf(pdfBuffer);
    
    const { output } = await prompt({ pdfTextContent: data.text });
    
    if (output) {
      if (output.supplier) {
        output.supplier = output.supplier.toUpperCase();
      }
      if (output.materialName) {
        output.materialName = output.materialName.toUpperCase();
      }
    }
    
    return output!;
  }
);
