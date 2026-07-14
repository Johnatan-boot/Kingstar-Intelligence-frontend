const fs = require('fs');
const file = 'src/services/api.ts';
let content = fs.readFileSync(file, 'utf8');

const regex = /const totalPending = mockPos.filter\(p => p.status === 'PENDING'\).length;/;
const replacement = `const totalPending = mockPos.filter(p => p.status === 'PENDING').length;`;

content = content.replace(
  /export const analyticsApi = \{[\s\S]*?dashboard: async \(\) => \{[\s\S]*?\}\s*\};\s*\n\s*\}/,
  `export const analyticsApi = {
  dashboard: async () => {
    // Simulate delay
    await new Promise(r => setTimeout(r, 800));
    
    // Dynamic calculation
    const totalCompleted = mockPos.filter(p => p.status === 'COMPLETED').length;
    const totalPending = mockPos.filter(p => p.status === 'PENDING').length;
    const totalCancelled = mockPos.filter(p => p.status === 'CANCELLED').length;
    const totalReceiving = mockReceivings.filter(r => r.status === 'IN_PROGRESS').length;
    const totalConferences = mockConferences.length;
    
    const completedConferencesToday = mockConferences.filter(c => c.status === 'APPROVED').length;
    // O número de pedidos pendentes sempre será igual ao número de veículos em recebimento na interface
    const pedidosPendentesReal = mockReceivings.length;

    return {
      data: {
        data: {
          metrics: {
            totalCompletedNFs: totalCompleted,
            totalVehiclesReceived: mockReceivings.length,
            totalPiecesChecked: 15420,
            errorRate: 1.2,
            totalDamages: 8,
            totalDivergences: 12,
            avgReceivingMin: 45,
            avgConferenceMin: 82
          },
          score: {
            total: 92,
            classification: 'Excelente'
          },
          history: Array.from({ length: 14 }).map((_, i) => ({
            date: new Date(Date.now() - (13 - i) * 86400000).toISOString(),
            total: Math.floor(Math.random() * 50) + 10,
            completed: Math.floor(Math.random() * 40) + 10
          })),
          supplierScores: [
            { supplier: 'Fornecedor Premium SA', score: 98, totalDeliveries: 45, divergences: 0, avgDeliveryTime: 32 },
            { supplier: 'Distribuidora ABC', score: 85, totalDeliveries: 22, divergences: 3, avgDeliveryTime: 45 },
            { supplier: 'Industria XPTO', score: 65, totalDeliveries: 12, divergences: 5, avgDeliveryTime: 120 }
          ],
          kpis: {
            completed_pos: totalCompleted,
            conference_pos: totalConferences,
            receiving_pos: totalReceiving,
            pending_pos: pedidosPendentesReal,
            cancelled_pos: totalCancelled,
            completed_conferences_today: completedConferencesToday
          }
        }
      }
    };
  }
};`
);

fs.writeFileSync(file, content);
