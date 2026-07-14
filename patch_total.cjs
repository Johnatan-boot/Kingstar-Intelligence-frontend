const fs = require('fs');
const file = 'src/apps/mfe-estoque/index.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /total_value: parseFloatSafe\(getVal\(row, \['total_value', 'valor total', 'total', 'valor total \(r\$\)'\]\)\),/,
  "total_value: parseFloatSafe(getVal(row, ['total_value', 'valor total', 'total', 'valor total (r$)'])) || (parseFloatSafe(getVal(row, ['quantity_physical', 'qtd fisico', 'físico', 'fisico', 'estoque maximo'])) * parseFloatSafe(getVal(row, ['average_cost', 'custo', 'custo medio', 'valor unitario', 'valor unitario (r$)']))),"
);

fs.writeFileSync(file, content);
