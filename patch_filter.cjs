const fs = require('fs');
const file = 'src/apps/mfe-estoque/index.tsx';
let content = fs.readFileSync(file, 'utf8');

const newMapped = `        const mappedData: StockRow[] = processedData
          .map((row: any) => ({
            sku_id: getVal(row, ['sku_id', 'sku']) || \`SKU-\${Math.floor(Math.random() * 10000)}\`,
            description: getVal(row, ['description', 'descricao', 'descrição', 'produto']) || 'Produto Importado',
            category: getVal(row, ['category', 'categoria']) || 'Geral',
            quantity_physical: parseFloatSafe(getVal(row, ['quantity_physical', 'qtd fisico', 'físico', 'fisico', 'estoque maximo'])),
            quantity_reserved: parseFloatSafe(getVal(row, ['quantity_reserved', 'qtd reservado', 'reservado'])),
            quantity_available: parseFloatSafe(getVal(row, ['quantity_available', 'qtd disponivel', 'disponivel', 'estoque atual'])),
            average_cost: parseFloatSafe(getVal(row, ['average_cost', 'custo', 'custo medio', 'valor unitario', 'valor unitario (r$)'])),
            total_value: parseFloatSafe(getVal(row, ['total_value', 'valor total', 'total', 'valor total (r$)'])),
            status: getVal(row, ['status']) || 'NORMAL',
            location_code: getVal(row, ['location_code', 'localizacao', 'localização']) || 'A01-01',
            zone: getVal(row, ['zone', 'zona']) || 'A',
            last_movement_at: new Date().toISOString()
          }))
          .filter(r => !r.sku_id.includes('...') && !r.description.includes('...') && r.sku_id !== 'SKU');`;

content = content.replace(
  /const mappedData: StockRow\[\] = processedData\.map\(\(row: any\) => \(\{[\s\S]*?last_movement_at: new Date\(\)\.toISOString\(\)\s*\}\)\);/,
  newMapped
);

fs.writeFileSync(file, content);
