const fs = require('fs');
const file = 'src/apps/mfe-estoque/index.tsx';
let content = fs.readFileSync(file, 'utf8');

const newMapped = `        const mappedData: StockRow[] = processedData
          .filter((row: any) => {
             // Ignorar linhas de separador markdown (ex: | --- | --- |)
             const vals = Object.values(row).map(v => String(v));
             const isSeparator = vals.some(v => v.includes('---'));
             return !isSeparator;
          })
          .map((row: any) => ({
            sku_id: getVal(row, ['sku_id', 'sku']) || \`SKU-\${Math.floor(Math.random() * 10000)}\`,
            description: getVal(row, ['description', 'descricao', 'descrição', 'produto']) || 'Produto Importado',
            category: getVal(row, ['category', 'categoria']) || 'Geral',
            quantity_physical: parseFloatSafe(getVal(row, ['quantity_physical', 'qtd fisico', 'físico', 'fisico', 'estoque maximo'])),
            quantity_reserved: parseFloatSafe(getVal(row, ['quantity_reserved', 'qtd reservado', 'reservado'])),
            quantity_available: parseFloatSafe(getVal(row, ['quantity_available', 'qtd disponivel', 'disponivel', 'estoque atual'])),
            average_cost: parseFloatSafe(getVal(row, ['average_cost', 'custo', 'custo medio', 'valor unitario', 'valor unitario (r$)'])),
            total_value: parseFloatSafe(getVal(row, ['total_value', 'valor total', 'total', 'valor total (r$)'])) || (parseFloatSafe(getVal(row, ['quantity_physical', 'qtd fisico', 'físico', 'fisico', 'estoque maximo'])) * parseFloatSafe(getVal(row, ['average_cost', 'custo', 'custo medio', 'valor unitario', 'valor unitario (r$)']))),
            status: getVal(row, ['status']) || 'NORMAL',
            location_code: getVal(row, ['location_code', 'localizacao', 'localização']) || 'A01-01',
            zone: getVal(row, ['zone', 'zona']) || 'A',
            order_number: getVal(row, ['order_number', 'pedido', 'nº pedido', 'numero pedido']) || '',
            nf_number: getVal(row, ['nf_number', 'nf', 'nota fiscal', 'nº nf', 'nota']) || '',
            last_movement_at: new Date().toISOString()
          }))
          .filter(r => !r.sku_id.includes('...') && !r.description.includes('...') && r.sku_id !== 'SKU');`;

content = content.replace(
  /const mappedData: StockRow\[\] = processedData[\s\S]*?\.filter\(r => !r\.sku_id\.includes\('\.\.\.'\) && !r\.description\.includes\('\.\.\.'\) && r\.sku_id !== 'SKU'\);/,
  newMapped
);

fs.writeFileSync(file, content);
