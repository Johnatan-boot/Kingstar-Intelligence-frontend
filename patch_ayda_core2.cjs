const fs = require('fs');
const file = 'src/apps/mfe-ayda/index.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the handleSend logic to fetch actual data from API to contextualize AI
content = content.replace(
  /const context = \`[\s\S]*?\`;/,
  `const analyticsData = await import('../../services/api').then(m => m.analyticsApi.dashboard());
      const kpis = analyticsData.data.data.kpis;
      const context = \`
        Pedidos Pendentes: \${kpis.pending_pos}.
        Recebimentos em Andamento: \${kpis.receiving_pos}.
        Conferências: \${kpis.conference_pos} hoje.
        Estoque: Corredor A em 92% (Curva A - Alta Rotatividade).
      \`;`
);

fs.writeFileSync(file, content);
