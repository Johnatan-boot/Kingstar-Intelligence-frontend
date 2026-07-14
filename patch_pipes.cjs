const fs = require('fs');
const file = 'src/apps/mfe-estoque/index.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the getVal and parseFloatSafe functions to strip out pipes
const newFunctions = `        const getVal = (r: any, keys: string[]) => {
          const rowKeys = Object.keys(r);
          for (const k of keys) {
             const kNorm = k.normalize('NFD').replace(/[\\u0300-\\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
             const foundKey = rowKeys.find(rk => {
               const rkNorm = rk.replace(/\\|/g, '').trim().normalize('NFD').replace(/[\\u0300-\\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
               if (!rkNorm) return false;
               return rkNorm === kNorm || rkNorm.includes(kNorm) || kNorm.includes(rkNorm);
             });
             if (foundKey !== undefined && r[foundKey] !== undefined && r[foundKey] !== null && String(r[foundKey]).trim() !== '') {
               let val = r[foundKey];
               if (typeof val === 'string') {
                 val = val.replace(/\\|/g, '').trim();
               }
               return val;
             }
          }
          return undefined;
        };

        const parseFloatSafe = (val: any) => {
          if (typeof val === 'number') return val;
          if (typeof val !== 'string') return 0;
          let s = val.replace(/\\|/g, '').trim().replace(/R\\$\\s?/g, '');
          if (s.includes(',') && s.includes('.')) {
            if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
              s = s.replace(/\\./g, '').replace(',', '.');
            } else {
              s = s.replace(/,/g, '');
            }
          } else if (s.includes(',')) {
            s = s.replace(',', '.');
          }
          const parsed = parseFloat(s);
          return isNaN(parsed) ? 0 : parsed;
        };`;

content = content.replace(
  /const getVal = \(r: any, keys: string\[\]\) => \{[\s\S]*?return isNaN\(parsed\) \? 0 : parsed;\s*\};/,
  newFunctions.trim()
);

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
            last_movement_at: new Date().toISOString()
          }))
          .filter(r => !r.sku_id.includes('...') && !r.description.includes('...') && r.sku_id !== 'SKU');`;

content = content.replace(
  /const mappedData: StockRow\[\] = processedData[\s\S]*?\.filter\(r => !r\.sku_id\.includes\('\.\.\.'\) && !r\.description\.includes\('\.\.\.'\) && r\.sku_id !== 'SKU'\);/,
  newMapped
);

fs.writeFileSync(file, content);
