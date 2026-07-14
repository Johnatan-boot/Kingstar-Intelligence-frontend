const rawData = [
  {
    "| SKU      | Produto                         |  Categoria | Estoque Máximo | Estoque Atual | Valor Unitário (R$) | Valor Total (R$) | Status  | Localização |": "| -------- | ------------------------------- | ---------: | -------------: | ------------: | ------------------: | ---------------: | ------- | ----------- |"
  },
  {
    "| SKU      | Produto                         |  Categoria | Estoque Máximo | Estoque Atual | Valor Unitário (R$) | Valor Total (R$) | Status  | Localização |": "| SKU-0001 | Colchão Queen Molas Ensacadas   |   COLCHÕES |             30 |            23 |              741,55 |        22.246,50 | NORMAL  | A1-1        |"
  }
];

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

console.log("Processed:", processedData);

const getVal = (r, keys) => {
  const rowKeys = Object.keys(r);
  for (const k of keys) {
     const kNorm = k.normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
     const foundKey = rowKeys.find(rk => {
       const rkNorm = rk.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
       return rkNorm === kNorm || rkNorm.includes(kNorm) || kNorm.includes(rkNorm);
     });
     if (foundKey !== undefined && r[foundKey] !== undefined && r[foundKey] !== null && String(r[foundKey]).trim() !== '') return r[foundKey];
  }
  return undefined;
};

console.log("SKU:", getVal(processedData[0], ['sku_id', 'sku']));
console.log("Produto:", getVal(processedData[0], ['description', 'descricao', 'descrição', 'produto']));
console.log("Preço:", getVal(processedData[0], ['average_cost', 'custo', 'custo medio', 'valor unitario']));

