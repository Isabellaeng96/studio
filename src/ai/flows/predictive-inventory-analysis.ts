
'use server';
/**
 * @fileOverview Fluxo de análise preditiva de estoque usando dados históricos para prever o consumo futuro.
 *
 * - predictMaterialConsumption - Prevê o consumo futuro de um ou mais materiais com base em dados históricos.
 * - PredictiveInventoryAnalysisInput - O tipo de entrada para a função predictMaterialConsumption.
 * - PredictiveInventoryAnalysisOutput - O tipo de retorno para a função predictMaterialConsumption.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictiveInventoryAnalysisInputSchema = z.object({
  materials: z.array(z.object({
    materialName: z.string().describe('O nome do material a ser previsto.'),
    historicalData: z.string().describe('Dados históricos de uso do material em formato JSON, incluindo datas e quantidades.'),
  })).describe('Uma lista de materiais para análise.'),
  forecastHorizon: z.string().describe('O período de tempo (ex: próximo mês, próximo trimestre) para o qual a previsão é necessária.'),
});
export type PredictiveInventoryAnalysisInput = z.infer<typeof PredictiveInventoryAnalysisInputSchema>;

const PredictionResultSchema = z.object({
  materialName: z.string().describe('O nome do material previsto.'),
  forecastedConsumption: z.number().describe('A quantidade de consumo prevista do material para o horizonte especificado.'),
  confidenceLevel: z.number().describe('Uma medida do nível de confiança (0 a 1) na previsão.'),
  explanation: z.string().describe('Explicação dos fatores que influenciam o consumo previsto.'),
});

const PredictiveInventoryAnalysisOutputSchema = z.object({
  predictions: z.array(PredictionResultSchema).describe('Uma lista de previsões para cada material solicitado.'),
});
export type PredictiveInventoryAnalysisOutput = z.infer<typeof PredictiveInventoryAnalysisOutputSchema>;

export async function predictMaterialConsumption(input: PredictiveInventoryAnalysisInput): Promise<PredictiveInventoryAnalysisOutput> {
  return predictiveInventoryAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictiveInventoryAnalysisPrompt',
  input: {schema: PredictiveInventoryAnalysisInputSchema},
  output: {schema: PredictiveInventoryAnalysisOutputSchema},
  prompt: `Você é um analista especialista em cadeia de suprimentos. Para cada material na lista a seguir, analise os dados históricos de uso e preveja o consumo para o horizonte de previsão especificado.

Horizonte de Previsão: {{{forecastHorizon}}}

Materiais para análise:
{{#each materials}}
- Nome do Material: {{{this.materialName}}}
  Dados Históricos: {{{this.historicalData}}}
{{/each}}

Para cada material, considere tendências, sazonalidade e quaisquer anomalias nos dados. Forneça uma quantidade de consumo prevista, um nível de confiança (0 a 1) e uma explicação dos fatores que influenciam a predição.

Garanta que o 'forecastedConsumption' seja um número e o 'confidenceLevel' esteja entre 0 e 1 para cada previsão.

A saída deve ser um objeto JSON contendo uma chave "predictions", que é uma lista de objetos, um para cada material. Exemplo de formato de saída:
{
  "predictions": [
    {
      "materialName": "NOME_DO_MATERIAL_1",
      "forecastedConsumption": "number",
      "confidenceLevel": "number",
      "explanation": "string"
    },
    {
      "materialName": "NOME_DO_MATERIAL_2",
      "forecastedConsumption": "number",
      "confidenceLevel": "number",
      "explanation": "string"
    }
  ]
}
`,
});

const predictiveInventoryAnalysisFlow = ai.defineFlow(
  {
    name: 'predictiveInventoryAnalysisFlow',
    inputSchema: PredictiveInventoryAnalysisInputSchema,
    outputSchema: PredictiveInventoryAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

