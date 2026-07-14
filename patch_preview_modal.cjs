const fs = require('fs');
const file = 'src/apps/mfe-compras/index.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /{\["#", "ID Planilha", "NF", "Fornecedor", "Data", "Itens", "Qtd", "Validação"\].map\(\(h\) => \(/,
  '{["#", "Nº Pedido", "NF", "Fornecedor", "Data", "Itens", "Qtd", "Validação"].map((h) => ('
);

content = content.replace(
  /<td className="px-4 py-3 font-mono text-gray-400">{row.id_planilha \?\? "—"}<\/td>/,
  '<td className="px-4 py-3 font-mono text-gray-400">{row.numero_pedido ?? row.pedido ?? "—"}</td>'
);

fs.writeFileSync(file, content);
