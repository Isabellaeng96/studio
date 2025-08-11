'use server';
/**
 * @fileOverview Predictive inventory analysis flow using historical data to forecast future consumption.
 *
 * - predictMaterialConsumption - Predicts future material consumption based on historical data.
 * - PredictiveInventoryAnalysisInput - The input type for the predictMaterialConsumption function.
 * - PredictiveInventoryAnalysisOutput - The return type for the predictMaterialConsumption function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictiveInventoryAnalysisInputSchema = z.object({
  materialName: z.string().describe('The name of the material to forecast.'),
  historicalData: z.string().describe('Historical usage data of the material in JSON format, including dates and quantities.'),
  forecastHorizon: z.string().describe('The time period (e.g., next month, next quarter) for which the forecast is needed.'),
});
export type PredictiveInventoryAnalysisInput = z.infer<typeof PredictiveInventoryAnalysisInputSchema>;

const PredictiveInventoryAnalysisOutputSchema = z.object({
  forecastedConsumption: z.number().describe('The forecasted consumption quantity of the material for the specified horizon.'),
  confidenceLevel: z.number().describe('A measure of the confidence level (0 to 1) in the forecast.'),
  explanation: z.string().describe('Explanation of factors influencing the predicted consumption.'),
});
export type PredictiveInventoryAnalysisOutput = z.infer<typeof PredictiveInventoryAnalysisOutputSchema>;

export async function predictMaterialConsumption(input: PredictiveInventoryAnalysisInput): Promise<PredictiveInventoryAnalysisOutput> {
  return predictiveInventoryAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictiveInventoryAnalysisPrompt',
  input: {schema: PredictiveInventoryAnalysisInputSchema},
  output: {schema: PredictiveInventoryAnalysisOutputSchema},
  prompt: `You are an expert supply chain analyst. Analyze the historical material usage data and forecast the material consumption for the specified forecast horizon.

Material Name: {{{materialName}}}
Historical Data: {{{historicalData}}}
Forecast Horizon: {{{forecastHorizon}}}

Consider trends, seasonality, and any anomalies in the data. Provide a forecasted consumption quantity, a confidence level (0 to 1), and an explanation of the factors influencing the prediction.

Ensure the forecastedConsumption is a number, and the confidenceLevel is between 0 and 1.

Output in JSON format:
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
