const fs = require('fs');
const file = 'src/apps/mfe-ayda/index.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace handleSend context logic to just use kpis
content = content.replace(
  /const context = \`[\s\S]*?\`;/,
  `const context = \`
        Pedidos Pendentes: \${kpis.pending_pos}.
        Recebimentos em Andamento: \${kpis.receiving_pos}.
        Conferências: \${kpis.conference_pos} hoje.
        Estoque: Corredor A em 92% (Curva A - Alta Rotatividade).
      \`;`
);

fs.writeFileSync(file, content);
