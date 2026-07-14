const XLSX = require('xlsx');

// Markdown Table text
const text = `| SKU      | Produto                         |  Categoria | Estoque Máximo | Estoque Atual | Valor Unitário (R$) | Valor Total (R$) | Status  | Localização |
| -------- | ------------------------------- | ---------: | -------------: | ------------: | ------------------: | ---------------: | ------- | ----------- |
| SKU-0001 | Colchão Queen Molas Ensacadas   |   COLCHÕES |             30 |            23 |              741,55 |        22.246,50 | NORMAL  | A1-1        |
| SKU-0002 | Colchão Casal Espuma D33        |   CAMA BOX |             42 |            42 |              152,38 |         6.399,96 | NORMAL  | B1-2        |
| SKU-0003 | Cama Box Baú Queen              | ACESSÓRIOS |             12 |             7 |              517,10 |         6.205,20 | CRÍTICO | C1-3        |
| SKU-0004 | Colchão Solteiro D45            | CABECEIRAS |             28 |            21 |              597,73 |        16.736,44 | NORMAL  | D1-4        |
| SKU-0005 | Cama Box King Size              |   COLCHÕES |             14 |             6 |              749,54 |        10.493,56 | NORMAL  | E1-1        |`;

// If user pasted this in Excel, typically it goes into one column.
// Let's simulate that:
const aoa = text.split('\n').map(line => [line]);
const ws = XLSX.utils.aoa_to_sheet(aoa);
const rawData = XLSX.utils.sheet_to_json(ws);

let processedData = [];
if (rawData.length > 0) {
  const firstRow = rawData[0];
  const keys = Object.keys(firstRow);
  if (keys.length === 1 && typeof keys[0] === 'string' && keys[0].includes('|') && keys[0].toLowerCase().includes('sku')) {
    const headerStr = keys[0];
    const headers = headerStr.split('|').map(s => s.trim()).filter(s => s);
    
    rawData.forEach(row => {
      const valStr = row[keys[0]];
      if (typeof valStr === 'string' && valStr.includes('|')) {
        if (valStr.includes('---')) return;
        
        const values = valStr.split('|').map(s => s.trim()).filter(s => s);
        if (values.length >= headers.length || values.length > 0) {
           const obj = {};
           headers.forEach((h, i) => {
             if (values[i] !== undefined) obj[h] = values[i];
           });
           processedData.push(obj);
        }
      }
    });
  } else {
     processedData = rawData;
  }
}

const getVal = (r, keys) => {
  const rowKeys = Object.keys(r);
  for (const k of keys) {
     const kNorm = k.normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
     const foundKey = rowKeys.find(rk => {
       const rkNorm = rk.replace(/\|/g, '').trim().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
       if (!rkNorm) return false;
       return rkNorm === kNorm || (kNorm.length >= 4 && rkNorm.includes(kNorm));
     });
     if (foundKey !== undefined && r[foundKey] !== undefined && r[foundKey] !== null && String(r[foundKey]).trim() !== '') {
       let val = r[foundKey];
       if (typeof val === 'string') {
         val = val.replace(/\|/g, '').trim();
       }
       return val;
     }
  }
  return undefined;
};

const parseFloatSafe = (val) => {
  if (typeof val === 'number') return val;
  if (typeof val !== 'string') return 0;
  let s = val.replace(/\|/g, '').trim().replace(/R\$\s?/g, '');
  if (s.includes(',') && s.includes('.')) {
    if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      s = s.replace(/,/g, '');
    }
  } else if (s.includes(',')) {
    s = s.replace(',', '.');
  }
  const parsed = parseFloat(s);
  return isNaN(parsed) ? 0 : parsed;
};

const mappedData = processedData
  .filter(row => {
     const vals = Object.values(row).map(v => String(v));
     const isSeparator = vals.some(v => v.includes('---'));
     return !isSeparator;
  })
  .map(row => ({
    sku_id: getVal(row, ['sku_id', 'sku']) || `SKU-${Math.floor(Math.random() * 10000)}`,
    description: getVal(row, ['description', 'descricao', 'descrição', 'produto']) || 'Produto Importado',
    category: getVal(row, ['category', 'categoria']) || 'Geral',
    quantity_physical: parseFloatSafe(getVal(row, ['quantity_physical', 'qtd fisico', 'físico', 'fisico', 'estoque maximo'])),
    quantity_reserved: parseFloatSafe(getVal(row, ['quantity_reserved', 'qtd reservado', 'reservado'])),
    quantity_available: parseFloatSafe(getVal(row, ['quantity_available', 'qtd disponivel', 'disponivel', 'estoque atual'])),
    average_cost: parseFloatSafe(getVal(row, ['average_cost', 'custo', 'custo medio', 'valor unitario', 'valor unitario (r$)'])),
    total_value: parseFloatSafe(getVal(row, ['total_value', 'valor total', 'total', 'valor total (r$)'])) || (parseFloatSafe(getVal(row, ['quantity_physical', 'qtd fisico', 'físico', 'fisico', 'estoque maximo'])) * parseFloatSafe(getVal(row, ['average_cost', 'custo', 'custo medio', 'valor unitario', 'valor unitario (r$)']))),
    status: getVal(row, ['status']) || 'NORMAL',
    location_code: getVal(row, ['location_code', 'localizacao', 'localização']) || 'A01-01',
  }))
  .filter(r => !r.sku_id.includes('...') && !r.description.includes('...') && r.sku_id !== 'SKU');

console.log(mappedData.slice(0, 2));

