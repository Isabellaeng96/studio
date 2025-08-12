'use server';
/**
 * @fileOverview Extrai informações de transação de um texto de PDF.
 *
 * - extractTransactionFromPdf - Analisa o texto de um PDF para extrair detalhes da transação.
 * - TransactionExtractionInput - O tipo de entrada para a função extractTransactionFromPdf.
 * - TransactionExtractionOutput - O tipo de retorno para a função extractTransactionFromPdf.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TransactionExtractionInputSchema = z.object({
  pdfTextContent: z.string().describe('O conteúdo de texto completo extraído de um documento PDF, como uma nota fiscal.'),
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
  input: { schema: TransactionExtractionInputSchema },
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
    const { output } = await prompt(input);
    return output!;
  }
);
