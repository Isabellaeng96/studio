'use server';
/**
 * @fileOverview Fluxo de análise preditiva de estoque usando dados históricos para prever o consumo futuro.
 *
 * - predictMaterialConsumption - Prevê o consumo futuro de material com base em dados históricos.
 * - PredictiveInventoryAnalysisInput - O tipo de entrada para a função predictMaterialConsumption.
 * - PredictiveInventoryAnalysisOutput - O tipo de retorno para a função predictMaterialConsumption.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictiveInventoryAnalysisInputSchema = z.object({
  materialName: z.string().describe('O nome do material a ser previsto.'),
  historicalData: z.string().describe('Dados históricos de uso do material em formato JSON, incluindo datas e quantidades.'),
  forecastHorizon: z.string().describe('O período de tempo (ex: próximo mês, próximo trimestre) para o qual a previsão é necessária.'),
});
export type PredictiveInventoryAnalysisInput = z.infer<typeof PredictiveInventoryAnalysisInputSchema>;

const PredictiveInventoryAnalysisOutputSchema = z.object({
  forecastedConsumption: z.number().describe('A quantidade de consumo prevista do material para o horizonte especificado.'),
  confidenceLevel: z.number().describe('Uma medida do nível de confiança (0 a 1) na previsão.'),
  explanation: z.string().describe('Explicação dos fatores que influenciam o consumo previsto.'),
});
export type PredictiveInventoryAnalysisOutput = z.infer<typeof PredictiveInventoryAnalysisOutputSchema>;

export async function predictMaterialConsumption(input: PredictiveInventoryAnalysisInput): Promise<PredictiveInventoryAnalysisOutput> {
  return predictiveInventoryAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictiveInventoryAnalysisPrompt',
  input: {schema: PredictiveInventoryAnalysisInputSchema},
  output: {schema: PredictiveInventoryAnalysisOutputSchema},
  prompt: `Você é um analista especialista em cadeia de suprimentos. Analise os dados históricos de uso de material e preveja o consumo de material para o horizonte de previsão especificado.

Nome do Material: {{{materialName}}}
Dados Históricos: {{{historicalData}}}
Horizonte de Previsão: {{{forecastHorizon}}}

Considere tendências, sazonalidade e quaisquer anomalias nos dados. Forneça uma quantidade de consumo prevista, um nível de confiança (0 a 1) e uma explicação dos fatores que influenciam a predição.

Garanta que o 'forecastedConsumption' seja um número e o 'confidenceLevel' esteja entre 0 e 1.

Saída em formato JSON:
{ 
  "forecastedConsumption": "number",
  "confidenceLevel": "number",
  "explanation": "string"
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
