const fs = require('fs');
const file = 'src/apps/mfe-compras/index.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /id_planilha: normalized.id \?\? "",/,
  `numero_pedido: normalized.pedido ?? normalized.numero_pedido ?? normalized.id ?? "",`
);

content = content.replace(
  /const r: any = \{/,
  `const r: any = {`
);

fs.writeFileSync(file, content);
