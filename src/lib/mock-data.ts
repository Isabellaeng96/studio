import type { Material, Transaction } from '@/types';

export const materials: Material[] = [
  { id: 'mat-001', name: 'CIMENTO CP-II', unit: 'saco 25kg', category: 'Estrutura', minStock: 20, currentStock: 15, supplier: 'VOTORANTIM' },
  { id: 'mat-002', name: 'TUBO DE REVESTIMENTO 6"', unit: 'm', category: 'Hidráulica', minStock: 50, currentStock: 120, supplier: 'TIGRE' },
  { id: 'mat-003', name: 'AREIA MÉDIA', unit: 'm³', category: 'Agregado', minStock: 10, currentStock: 25 },
  { id: 'mat-004', name: 'BOMBA SUBMERSA 1.5CV', unit: 'unidade', category: 'Equipamento', minStock: 2, currentStock: 3, supplier: 'FRANKLIN ELECTRIC' },
  { id: 'mat-005', name: 'CABO ELÉTRICO 4MM', unit: 'm', category: 'Elétrica', minStock: 100, currentStock: 350 },
  { id: 'mat-006', name: 'TINTA ACRÍLICA BRANCA', unit: 'lata 18L', category: 'Acabamento', minStock: 5, currentStock: 4, supplier: 'SUVINIL' },
];

export const transactions: Transaction[] = [
  { id: 'trn-001', type: 'saida', date: new Date('2024-07-20T10:00:00Z').getTime(), materialId: 'mat-001', materialName: 'CIMENTO CP-II', quantity: 10, responsible: 'João Silva', osNumber: 'OS-123', costCenter: 'Projeto A' },
  { id: 'trn-002', type: 'entrada', date: new Date('2024-07-19T15:30:00Z').getTime(), materialId: 'mat-002', materialName: 'TUBO DE REVESTIMENTO 6"', quantity: 100, supplier: 'TIGRE', invoice: 'NF-12345', responsible: 'Maria Oliveira' },
  { id: 'trn-003', type: 'saida', date: new Date('2024-07-18T08:00:00Z').getTime(), materialId: 'mat-004', materialName: 'BOMBA SUBMERSA 1.5CV', quantity: 1, responsible: 'Carlos Pereira', osNumber: 'OS-124', costCenter: 'Manutenção Geral' },
  { id: 'trn-004', type: 'entrada', date: new Date('2024-07-17T11:00:00Z').getTime(), materialId: 'mat-001', materialName: 'CIMENTO CP-II', quantity: 50, supplier: 'VOTORANTIM', invoice: 'NF-12300', responsible: 'Maria Oliveira' },
  { id: 'trn-005', type: 'saida', date: new Date('2024-07-16T14:20:00Z').getTime(), materialId: 'mat-005', materialName: 'CABO ELÉTRICO 4MM', quantity: 200, responsible: 'João Silva', osNumber: 'OS-125' },
  { id: 'trn-006', type: 'entrada', date: new Date('2024-07-15T09:00:00Z').getTime(), materialId: 'mat-006', materialName: 'TINTA ACRÍLICA BRANCA', quantity: 10, supplier: 'SUVINIL', invoice: 'NF-99887', responsible: 'Maria Oliveira' },
];
