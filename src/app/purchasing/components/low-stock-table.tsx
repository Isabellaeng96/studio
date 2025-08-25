
"use client";

import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Material } from "@/types"
import { Badge } from "@/components/ui/badge"

interface LowStockTableProps {
  materials: Material[];
  selectedMaterials: string[];
  setSelectedMaterials: React.Dispatch<React.SetStateAction<string[]>>;
}

export function LowStockTable({ materials, selectedMaterials, setSelectedMaterials }: LowStockTableProps) {
  
  const handleSelectAll = (checked: boolean) => {
    setSelectedMaterials(checked ? materials.map(m => m.id) : []);
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    setSelectedMaterials(prev => 
      checked ? [...prev, id] : prev.filter(materialId => materialId !== id)
    );
  };
  
  if (materials.length === 0) {
    return (
        <div className="flex items-center justify-center h-40 border-dashed border-2 rounded-md">
            <p className="text-muted-foreground">Nenhum material com estoque baixo no momento.</p>
        </div>
    )
  }

  return (
    <div className="rounded-md border">
        <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-12">
                    <Checkbox
                        checked={selectedMaterials.length > 0 && selectedMaterials.length === materials.length}
                        onCheckedChange={handleSelectAll}
                        aria-label="Selecionar todos"
                    />
                </TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Fornecedor Padrão</TableHead>
                <TableHead className="text-right">Estoque Mínimo</TableHead>
                <TableHead className="text-right">Estoque Atual</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {materials.map(material => (
                <TableRow key={material.id} data-state={selectedMaterials.includes(material.id) ? "selected" : ""}>
                    <TableCell>
                        <Checkbox
                            checked={selectedMaterials.includes(material.id)}
                            onCheckedChange={(checked) => handleSelectRow(material.id, !!checked)}
                            aria-label={`Selecionar ${material.name}`}
                        />
                    </TableCell>
                    <TableCell className="font-medium">{material.name}</TableCell>
                    <TableCell>
                        {material.supplier ? <Badge variant="secondary">{material.supplier}</Badge> : '-'}
                    </TableCell>
                    <TableCell className="text-right font-mono">{material.minStock}</TableCell>
                    <TableCell className="text-right font-bold text-destructive font-mono">{material.currentStock}</TableCell>
                </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
  )
}
