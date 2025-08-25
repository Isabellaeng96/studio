
"use client";

import { useState, useMemo } from 'react';
import { ShoppingCart } from 'lucide-react';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { useAppContext } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { LowStockTable } from './components/low-stock-table';
import { PurchaseOrderForm } from './components/purchase-order-form';
import type { PurchaseOrderItem } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PurchasingPage() {
  const { activeMaterials, suppliers } = useAppContext();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [showOrderForm, setShowOrderForm] = useState(false);

  const lowStockMaterials = useMemo(() => {
    return activeMaterials
      .filter(m => m.currentStock <= m.minStock)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [activeMaterials]);

  const handleGenerateOrder = () => {
    if (selectedMaterials.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Nenhum material selecionado',
        description: 'Por favor, selecione pelo menos um material para gerar o pedido.',
      });
      return;
    }
    setShowOrderForm(true);
  };
  
  const handleCancelOrder = () => {
    setShowOrderForm(false);
    setSelectedMaterials([]);
  }

  const exportToFile = (supplierId: string, items: Omit<PurchaseOrderItem, 'supplierId'>[], formatType: 'pdf' | 'xlsx') => {
    if (items.length === 0) return;
    
    const supplier = suppliers.find(s => s.id === supplierId);
    if (!supplier) {
        toast({
            variant: "destructive",
            title: "Fornecedor não encontrado",
            description: "O fornecedor selecionado não foi encontrado.",
        });
        return;
    }

    const orderItems = items.map(item => {
        const material = activeMaterials.find(m => m.id === item.materialId);
        return {
            ...material,
            orderQuantity: item.quantity,
        }
    }).filter(item => item.id); // Filter out any items where material was not found

    const filename = `pedido_orcamento_${supplier.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}`;
    
    if (formatType === 'pdf') {
      exportToPDF(supplier.name, orderItems, filename);
    } else {
      exportToXLSX(supplier.name, orderItems, filename);
    }

    toast({
      title: 'Exportação Concluída',
      description: `Seu arquivo ${formatType.toUpperCase()} foi gerado para o fornecedor ${supplier.name}.`,
    });
  }

  const exportToPDF = (supplierName: string, items: any[], filename: string) => {
    const doc = new jsPDF();
    const generationDate = new Date();
    let yPosition = 22;

    doc.setFontSize(18);
    doc.text(`Pedido de Orçamento - ${supplierName}`, 14, yPosition);
    yPosition += 15;

    autoTable(doc, {
      startY: yPosition,
      head: [['Material', 'Código', 'Unidade', 'Qtd. Pedido']],
      body: items.map(item => [item.name, item.id, item.unit, item.orderQuantity]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: '#3b82f6' },
      didDrawPage: (data) => {
        const str = `Página ${data.pageNumber}`;
        doc.setFontSize(8);
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height || pageSize.getHeight();
        const pageWidth = pageSize.width || pageSize.getWidth();
        const userText = `Gerado por: ${user?.displayName || 'N/A'}`;
        const dateText = `Data: ${format(generationDate, 'dd/MM/yyyy HH:mm:ss')}`;
        doc.text(userText, data.settings.margin.left, pageHeight - 10);
        doc.text(str, pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.text(dateText, pageWidth - data.settings.margin.right, pageHeight - 10, { align: 'right' });
      }
    });
    
    doc.save(`${filename}.pdf`);
  };

  const exportToXLSX = (supplierName: string, items: any[], filename: string) => {
    const wb = XLSX.utils.book_new();
    const sheetData = items.map(item => ({
        'Fornecedor': supplierName,
        'Material': item.name,
        'Código': item.id,
        'Unidade': item.unit,
        'Quantidade Pedida': item.orderQuantity,
    }));
    const ws = XLSX.utils.json_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(wb, ws, supplierName.substring(0, 31)); // Sheet name limit is 31 chars
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const GenerateOrderButton = ({ className }: { className?: string }) => (
    <div className={cn("flex justify-end", className)}>
        <Button onClick={handleGenerateOrder} disabled={selectedMaterials.length === 0}>
            <ShoppingCart className="mr-2"/>
            Gerar Pedido ({selectedMaterials.length})
        </Button>
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pedidos de Compra</h1>
          <p className="text-muted-foreground">
            Crie e gerencie pedidos de compra para materiais com estoque baixo.
          </p>
        </div>
      </div>
      
      {showOrderForm ? (
        <PurchaseOrderForm 
          materialIds={selectedMaterials} 
          onCancel={handleCancelOrder}
          onExport={exportToFile}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Materiais com Estoque Baixo</CardTitle>
            <CardDescription>
              Selecione os materiais para incluir no pedido de compra e clique em "Gerar Pedido".
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockMaterials.length > 0 && (
                <GenerateOrderButton className="pb-4" />
            )}
            <LowStockTable 
              materials={lowStockMaterials}
              selectedMaterials={selectedMaterials}
              setSelectedMaterials={setSelectedMaterials}
            />
            {lowStockMaterials.length > 0 && (
                <GenerateOrderButton className="pt-6" />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
