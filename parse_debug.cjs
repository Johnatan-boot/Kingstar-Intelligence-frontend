const XLSX = require('xlsx');

// Let's create a simulated Excel file with what the user might be uploading
const mdData = [
  ["| SKU      ", "| Produto                         ", "|  Categoria ", "| Estoque Máximo ", "| Estoque Atual ", "| Valor Unitário (R$) ", "| Valor Total (R$) ", "| Status  ", "| Localização |"],
  ["| -------- ", "| ------------------------------- ", "| ---------: ", "| -------------: ", "| ------------: ", "| ------------------: ", "| ---------------: ", "| ------- ", "| ----------- |"],
  ["| SKU-0001 ", "| Colchão Queen Molas Ensacadas   ", "|   COLCHÕES ", "|             30 ", "|            23 ", "|              741,55 ", "|        22.246,50 ", "| NORMAL  ", "| A1-1        |"]
];

const ws = XLSX.utils.aoa_to_sheet(mdData);
const rawData = XLSX.utils.sheet_to_json(ws);
console.log("RAW DATA FIRST ROW KEYS:", Object.keys(rawData[0]));
console.log("RAW DATA FIRST ROW VALUES:", Object.values(rawData[0]));
console.log("RAW DATA SECOND ROW VALUES:", Object.values(rawData[1]));

const getVal = (r, keys) => {
  const rowKeys = Object.keys(r);
  for (const k of keys) {
     const kNorm = k.normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
     const foundKey = rowKeys.find(rk => {
       const rkNorm = rk.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
       if (!rkNorm) return false;
       return rkNorm === kNorm || rkNorm.includes(kNorm);
     });
     if (foundKey !== undefined && r[foundKey] !== undefined && r[foundKey] !== null && String(r[foundKey]).trim() !== '') {
       let val = r[foundKey];
       if (typeof val === 'string') {
         val = val.replace(/\|/g, '').trim(); // strip pipes
       }
       return val;
     }
  }
  return undefined;
};

console.log("SKU:", getVal(rawData[1], ['sku_id', 'sku']));
console.log("Desc:", getVal(rawData[1], ['description', 'descricao', 'descrição', 'produto']));
console.log("Cat:", getVal(rawData[1], ['category', 'categoria']));

