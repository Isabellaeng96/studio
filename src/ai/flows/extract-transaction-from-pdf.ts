
'use server';
/**
 * @fileOverview Extrai informações de transação de um documento PDF, incluindo detalhes de múltiplos materiais.
 *
 * - extractTransactionFromPdf - Analisa um arquivo PDF para extrair detalhes da transação e uma lista de materiais.
 * - TransactionExtractionInput - O tipo de entrada para a função extractTransactionFromPdf.
 * - TransactionExtractionOutput - O tipo de retorno para a função extractTransactionFromPdf.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const TransactionExtractionInputSchema = z.object({
  pdfDataUri: z.string().describe("O arquivo PDF como um data URI, que deve incluir um MIME type e usar codificação Base64. Formato esperado: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type TransactionExtractionInput = z.infer<typeof TransactionExtractionInputSchema>;


const MaterialDetailSchema = z.object({
    materialName: z.string().optional().describe('O nome do material ou produto principal encontrado.'),
    quantity: z.number().optional().describe('A quantidade do material. Deve ser apenas o valor numérico.'),
    unitPrice: z.number().optional().describe('O valor unitário do material. Deve ser apenas o valor numérico.'),
    unit: z.string().optional().describe('A unidade de medida do material (ex: un, kg, m).'),
    category: z.string().optional().describe('Uma categoria sugerida para o material com base no seu nome ou tipo.'),
});

const SupplierDetailSchema = z.object({
  name: z.string().optional().describe('O nome do fornecedor ou da empresa que emitiu o documento.'),
  cnpj: z.string().optional().describe('O CNPJ do fornecedor.'),
  phone: z.string().optional().describe('O telefone de contato do fornecedor.'),
  address: z.string().optional().describe('O endereço do fornecedor (rua, número, bairro).'),
  city: z.string().optional().describe('A cidade do fornecedor.'),
  state: z.string().optional().describe('O estado (sigla) do fornecedor.'),
});

const TransactionExtractionOutputSchema = z.object({
  supplier: SupplierDetailSchema.optional(),
  invoice: z.string().optional().describe('O número da nota fiscal ou fatura, se encontrado.'),
  freightCost: z.number().optional().describe('O valor do frete, se encontrado.'),
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
  prompt: `Você é um assistente de entrada de dados especialista em analisar texto de notas fiscais e faturas.
Sua tarefa é analisar o texto extraído de um PDF e extrair **apenas** as seguintes informações:

1.  **Dados do Fornecedor**:
    *   name: O nome do fornecedor ou da empresa.
    *   cnpj: O CNPJ do fornecedor.
    *   phone: O telefone de contato.
    *   address: O endereço completo (rua, número, bairro).
    *   city: A cidade.
    *   state: O estado (sigla com 2 letras, ex: SP, RJ).
2.  **Dados da Nota**:
    *   invoice: O número da nota fiscal ou fatura.
    *   freightCost: O valor do frete, se houver.
3.  **Lista de Materiais**:
    *   Para **cada item** listado, extraia: materialName, quantity, unitPrice, unit e category.
    *   Para quantity, unitPrice e freightCost, extraia **apenas o valor numérico**.
    *   Para category, sugira uma com base no nome do produto (ex: 'Hidráulica', 'Elétrica', 'Ferramenta').

Se um campo específico não for encontrado no texto, deixe-o em branco. **Não inclua nenhuma informação adicional ou desnecessária.** Foque em extrair os valores exatos.

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
      if (output.supplier && output.supplier.name) {
        output.supplier.name = output.supplier.name.toUpperCase();
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
