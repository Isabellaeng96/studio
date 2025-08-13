'use server';
/**
 * @fileOverview Extrai informações de material de um documento PDF.
 *
 * - extractMaterialFromPdf - Analisa um arquivo PDF para extrair detalhes do material para cadastro.
 * - MaterialExtractionInput - O tipo de entrada para a função extractMaterialFromPdf.
 * - MaterialExtractionOutput - O tipo de retorno para a função extractMaterialFromPdf.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MaterialExtractionInputSchema = z.object({
  pdfDataUri: z.string().describe("O arquivo PDF como um data URI, que deve incluir um MIME type e usar codificação Base64. Formato esperado: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type MaterialExtractionInput = z.infer<typeof MaterialExtractionInputSchema>;

const MaterialExtractionOutputSchema = z.object({
  name: z.string().optional().describe('O nome do material ou produto principal encontrado.'),
  unit: z.string().optional().describe('A unidade de medida do material (ex: un, kg, m).'),
  supplier: z.string().optional().describe('O nome do fornecedor ou da empresa que emitiu o documento.'),
  category: z.string().optional().describe('Uma categoria sugerida para o material com base no seu nome ou tipo.'),
  minStock: z.number().optional().default(0).describe('O estoque mínimo, se puder ser inferido. Padrão para 0.'),
});
export type MaterialExtractionOutput = z.infer<typeof MaterialExtractionOutputSchema>;


export async function extractMaterialFromPdf(input: MaterialExtractionInput): Promise<MaterialExtractionOutput> {
  return extractMaterialFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractMaterialPrompt',
  input: { schema: z.object({ pdfTextContent: z.string() }) },
  output: { schema: MaterialExtractionOutputSchema },
  prompt: `Você é um assistente de cadastro de produtos especializado em analisar texto de notas fiscais.
Analise o seguinte texto extraído de um PDF e identifique os seguintes campos para um novo material: nome, unidade de medida, fornecedor e sugira uma categoria.

Se um campo não for encontrado, deixe-o em branco. Foque em extrair os valores exatos.
Para o nome do material, procure a descrição de um produto.
Para a unidade, procure por abreviações como 'un', 'pc', 'kg', 'm', 'm2', 'm3'.
Para a categoria, sugira uma categoria com base no nome do produto (ex: 'Hidráulica', 'Elétrica', 'Ferramenta', 'Agregado').

Texto do PDF:
{{{pdfTextContent}}}

Retorne os dados extraídos no formato JSON.
`,
});

const extractMaterialFlow = ai.defineFlow(
  {
    name: 'extractMaterialFlow',
    inputSchema: MaterialExtractionInputSchema,
    outputSchema: MaterialExtractionOutputSchema,
  },
  async input => {
    const pdf = (await import('pdf-parse')).default;
    const base64Data = input.pdfDataUri.split(',')[1];
    const pdfBuffer = Buffer.from(base64Data, 'base64');
    
    const data = await pdf(pdfBuffer);
    
    const { output } = await prompt({ pdfTextContent: data.text });
    
    return output!;
  }
);
