import type { Material, Transaction } from '@/types';

export const materials: Material[] = [
  { id: 'mat-001', name: 'Cimento CP-II', unit: 'saco 25kg', category: 'Estrutura', minStock: 20, currentStock: 15, supplier: 'Votorantim' },
  { id: 'mat-002', name: 'Tubo de Revestimento 6"', unit: 'm', category: 'Hidráulica', minStock: 50, currentStock: 120, supplier: 'Tigre' },
  { id: 'mat-003', name: 'Areia Média', unit: 'm³', category: 'Agregado', minStock: 10, currentStock: 25 },
  { id: 'mat-004', name: 'Bomba Submersa 1.5CV', unit: 'unidade', category: 'Equipamento', minStock: 2, currentStock: 3, supplier: 'Franklin Electric' },
  { id: 'mat-005', name: 'Cabo Elétrico 4mm', unit: 'm', category: 'Elétrica', minStock: 100, currentStock: 350 },
  { id: 'mat-006', name: 'Tinta Acrílica Branca', unit: 'lata 18L', category: 'Acabamento', minStock: 5, currentStock: 4, supplier: 'Suvinil' },
];

export const transactions: Transaction[] = [
  { id: 'trn-001', type: 'saida', date: new Date('2024-07-20T10:00:00Z').getTime(), materialId: 'mat-001', materialName: 'Cimento CP-II', quantity: 10, responsible: 'João Silva' },
  { id: 'trn-002', type: 'entrada', date: new Date('2024-07-19T15:30:00Z').getTime(), materialId: 'mat-002', materialName: 'Tubo de Revestimento 6"', quantity: 100, supplier: 'Tigre', invoice: 'NF-12345', responsible: 'Maria Oliveira' },
  { id: 'trn-003', type: 'saida', date: new Date('2024-07-18T08:00:00Z').getTime(), materialId: 'mat-004', materialName: 'Bomba Submersa 1.5CV', quantity: 1, workFront: 'Poço P-03', responsible: 'Carlos Pereira' },
  { id: 'trn-004', type: 'entrada', date: new Date('2024-07-17T11:00:00Z').getTime(), materialId: 'mat-001', materialName: 'Cimento CP-II', quantity: 50, supplier: 'Votorantim', invoice: 'NF-12300', responsible: 'Maria Oliveira' },
  { id: 'trn-005', type: 'saida', date: new Date('2024-07-16T14:20:00Z').getTime(), materialId: 'mat-005', materialName: 'Cabo Elétrico 4mm', quantity: 200, responsible: 'João Silva' },
  { id: 'trn-006', type: 'entrada', date: new Date('2024-07-15T09:00:00Z').getTime(), materialId: 'mat-006', materialName: 'Tinta Acrílica Branca', quantity: 10, supplier: 'Suvinil', invoice: 'NF-99887', responsible: 'Maria Oliveira' },
];
