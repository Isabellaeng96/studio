"use client";

import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { Material } from '@/types';
import { MaterialForm } from './material-form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';

interface MaterialsTableProps {
  data: Material[];
  onSave: (material: Omit<Material, 'id' | 'currentStock'> & { id?: string }) => void;
  onDelete: (materialId: string) => void;
  onDeleteMultiple: (materialIds: string[]) => void;
  categories: string[];
}

export function MaterialsTable({ data, onSave, onDelete, onDeleteMultiple, categories }: MaterialsTableProps) {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(data.map(item => item.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };
  
  const handleDeleteSelected = () => {
    onDeleteMultiple(selectedRows);
    setSelectedRows([]);
  };

  return (
    <Card>
      {selectedRows.length > 0 && (
          <div className="flex items-center justify-between p-4 border-b">
              <div className="text-sm text-muted-foreground">
                  {selectedRows.length} de {data.length} linha(s) selecionada(s).
              </div>
              <AlertDialog>
                  <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir Selecionados
                      </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                      <AlertDialogHeader>
                          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                          <AlertDialogDescription>
                              Essa ação não pode ser desfeita. Isso irá excluir permanentemente os {selectedRows.length} materiais selecionados.
                          </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteSelected}>Continuar</AlertDialogAction>
                      </AlertDialogFooter>
                  </AlertDialogContent>
              </AlertDialog>
          </div>
      )}
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                  <Checkbox
                      checked={selectedRows.length > 0 && selectedRows.length === data.length}
                      onCheckedChange={handleSelectAll}
                      aria-label="Selecionar todos"
                  />
              </TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead className="text-right">Estoque Atual</TableHead>
              <TableHead className="text-right">Estoque Mín.</TableHead>
              <TableHead className="w-[50px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map(material => (
              <TableRow key={material.id} data-state={selectedRows.includes(material.id) ? "selected" : ""}>
                 <TableCell>
                    <Checkbox
                        checked={selectedRows.includes(material.id)}
                        onCheckedChange={() => handleSelectRow(material.id)}
                        aria-label="Selecionar linha"
                    />
                 </TableCell>
                <TableCell className="font-medium">{material.name}</TableCell>
                <TableCell>
                  <span className="font-mono text-xs">{material.id}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{material.category}</Badge>
                </TableCell>
                <TableCell>{material.unit}</TableCell>
                <TableCell
                  className={cn(
                    'text-right font-mono',
                    material.currentStock < material.minStock &&
                      'text-destructive font-bold'
                  )}
                >
                  {material.currentStock}
                </TableCell>
                <TableCell className="text-right font-mono">{material.minStock}</TableCell>
                <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <MaterialForm material={material} onSave={onSave} categories={categories}>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                          </DropdownMenuItem>
                        </MaterialForm>
                        <AlertDialog>
                           <AlertDialogTrigger asChild>
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive focus:bg-destructive/10"
                              onSelect={(e) => e.preventDefault()}
                              >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                           </AlertDialogTrigger>
                           <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Essa ação não pode ser desfeita. Isso irá excluir permanentemente o material.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDelete(material.id)}>Continuar</AlertDialogAction>
                              </AlertDialogFooter>
                           </AlertDialogContent>
                        </AlertDialog>

                      </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
