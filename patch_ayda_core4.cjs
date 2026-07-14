const fs = require('fs');
const file = 'src/apps/mfe-ayda/index.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /const kpis = analyticsData.data.data.kpis;[\s\S]*?Estoque: Corredor A em 92% \(Curva A - Alta Rotatividade\).\n      \`;/,
  `const kpis = analyticsData.data.data.kpis;
      const context = \`
        Quantidade de Carros em Recebimento: \${kpis.receiving_pos}.
        Pedidos Pendentes: \${kpis.pending_pos}.
        Conferências: \${kpis.conference_pos} hoje.
        Estoque: Corredor A em 92% (Curva A - Alta Rotatividade).
      \`;`
);

fs.writeFileSync(file, content);
