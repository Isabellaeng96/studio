import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { materials, transactions } from "@/lib/mock-data";
import { ChartsView } from "./components/charts";
import { PredictiveAnalysis } from "./components/predictive-analysis";

export default function AnalysisPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analysis & Forecasting</h1>
        <p className="text-muted-foreground">
          Visualize inventory data and predict future needs.
        </p>
      </div>

      <Tabs defaultValue="charts">
        <TabsList>
          <TabsTrigger value="charts">Data Visualization</TabsTrigger>
          <TabsTrigger value="predictive">Predictive Analysis</TabsTrigger>
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
