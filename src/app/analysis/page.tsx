import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { materials, transactions } from "@/lib/mock-data";
import { ChartsView } from "./components/charts";
import { PredictiveAnalysis } from "./components/predictive-analysis";

export default function AnalysisPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Análise e Previsão</h1>
        <p className="text-muted-foreground">
          Visualize dados de estoque e preveja necessidades futuras.
        </p>
      </div>

      <Tabs defaultValue="charts">
        <TabsList>
          <TabsTrigger value="charts">Visualização de Dados</TabsTrigger>
          <TabsTrigger value="predictive">Análise Preditiva</TabsTrigger>
        </TabsList>
        <TabsContent value="charts" className="mt-6">
          <ChartsView materials={materials} transactions={transactions} />
        </TabsContent>
        <TabsContent value="predictive" className="mt-6">
          <PredictiveAnalysis materials={materials} transactions={transactions}/>
        </TabsContent>
      </Tabs>
    </div>
  );
}
