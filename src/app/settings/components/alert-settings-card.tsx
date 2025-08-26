
// src/app/settings/components/alert-settings-card.tsx
"use client";

import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export function AlertSettingsCard() {
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
      <Card>
        <CardHeader>
          <CardTitle>Configuração de Alertas de Estoque Mínimo</CardTitle>
          <CardDescription>
            Defina quais setores devem receber notificações por e-mail quando o estoque de um material estiver baixo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96 w-full rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
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
          </ScrollArea>
        </CardContent>
      </Card>
  );
}
