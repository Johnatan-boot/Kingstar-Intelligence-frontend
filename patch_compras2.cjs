const fs = require('fs');
const file = 'src/apps/mfe-compras/index.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix 1: Show 0,00 for val === 0
content = content.replace(
  /return val > 0 \? \`R\$ \$\{Number\(val\)\.toLocaleString\("pt-BR", \{ minimumFractionDigits: 2 \}\)\}\` : "—";/,
  'return (typeof val === "number" && !isNaN(val)) ? `R$ ${Number(val).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—";'
);

// Fix 2: Remove fallback to normalized.id for numero_pedido
content = content.replace(
  /numero_pedido: normalized.pedido \?\? normalized.numero_pedido \?\? normalized.id \?\? "",/,
  'numero_pedido: normalized.pedido ?? normalized.numero_pedido ?? "",'
);

fs.writeFileSync(file, content);
