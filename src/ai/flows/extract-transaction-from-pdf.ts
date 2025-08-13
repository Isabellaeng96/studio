'use server';
/**
 * @fileOverview Extrai informações de transação de um documento PDF, incluindo detalhes de múltiplos materiais.
 *
 * - extractTransactionFromPdf - Analisa um arquivo PDF para extrair detalhes da transação e uma lista de materiais.
 * - TransactionExtractionInput - O tipo de entrada para a função extractTransactionFromPdf.
 * - TransactionExtractionOutput - O tipo de retorno para a função extractTransactionFromPdf.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TransactionExtractionInputSchema = z.object({
  pdfDataUri: z.string().describe("O arquivo PDF como um data URI, que deve incluir um MIME type e usar codificação Base64. Formato esperado: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type TransactionExtractionInput = z.infer<typeof TransactionExtractionInputSchema>;


const MaterialDetailSchema = z.object({
    materialName: z.string().optional().describe('O nome do material ou produto principal encontrado.'),
    quantity: z.number().optional().describe('A quantidade do material.'),
    unit: z.string().optional().describe('A unidade de medida do material (ex: un, kg, m).'),
    category: z.string().optional().describe('Uma categoria sugerida para o material com base no seu nome ou tipo.'),
});

const TransactionExtractionOutputSchema = z.object({
  supplier: z.string().optional().describe('O nome do fornecedor ou da empresa que emitiu o documento.'),
  invoice: z.string().optional().describe('O número da nota fiscal ou fatura, se encontrado.'),
  materials: z.array(MaterialDetailSchema).describe('Uma lista de todos os materiais encontrados no documento.'),
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
Analise o seguinte texto extraído de um PDF e identifique os seguintes campos gerais: fornecedor e número da nota fiscal.

Além disso, identifique **TODOS** os materiais ou produtos listados no documento e crie uma lista para eles. Para cada item na lista, extraia: nome do material, quantidade, unidade de medida e sugira uma categoria.

Se um campo não for encontrado, deixe-o em branco. Foque em extrair os valores exatos.
Para o nome do material, procure por uma descrição de produto.
Para a unidade, procure por abreviações como 'un', 'pc', 'kg', 'm', 'm2', 'm3', 'sc'.
Para a categoria, sugira uma categoria com base no nome do produto (ex: 'Hidráulica', 'Elétrica', 'Ferramenta', 'Agregado', 'Estrutura').

Texto do PDF:
{{{pdfTextContent}}}

Retorne os dados extraídos no formato JSON, com uma lista de materiais.
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
      if (output.materials) {
        output.materials = output.materials.map(material => ({
          ...material,
          materialName: material.materialName?.toUpperCase()
        }));
      }
    }
    
    return output!;
  }
);
