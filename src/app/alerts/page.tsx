
// src/app/alerts/page.tsx
"use client";

import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

export default function AlertsPage() {
  const { activeMaterials, availableSectors, alertSettings, updateAlertSetting } = useAppContext();

  const handleCheckboxChange = (materialId: string, sector: string, checked: boolean) => {
    const currentSettings = alertSettings.find(s => s.materialId === materialId)?.sectors || [];
    let newSectors: string[];

    if (checked) {
      newSectors = [...currentSettings, sector];
    } else {
      newSectors = currentSettings.filter(s => s !== sector);
    }
    
    updateAlertSetting(materialId, newSectors);
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuração de Alertas</h1>
        <p className="text-muted-foreground">
          Defina quais setores devem receber notificações quando o estoque de um material estiver baixo.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Regras de Notificação por Material</CardTitle>
          <CardDescription>
            Marque os setores para ativar os alertas de estoque mínimo. Os alertas serão enviados quando o "Estoque Atual" for menor que o "Estoque Mínimo".
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Categoria</TableHead>
                  {availableSectors.map(sector => (
                    <TableHead key={sector} className="text-center">{sector}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeMaterials.map(material => {
                  const setting = alertSettings.find(s => s.materialId === material.id);
                  const sectorsForMaterial = setting?.sectors || [];
                  
                  return (
                    <TableRow key={material.id}>
                      <TableCell className="font-medium">{material.name}</TableCell>
                      <TableCell><Badge variant="secondary">{material.category}</Badge></TableCell>
                      {availableSectors.map(sector => (
                        <TableCell key={sector} className="text-center">
                          <Checkbox
                            checked={sectorsForMaterial.includes(sector)}
                            onCheckedChange={(checked) => {
                              handleCheckboxChange(material.id, sector, !!checked);
                            }}
                            id={`alert-${material.id}-${sector}`}
                            aria-label={`Notificar ${sector} para ${material.name}`}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
