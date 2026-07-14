const XLSX = require('xlsx');

// Maybe the user pasted the table into Excel, and Excel put it in one column!
// Or maybe they pasted it and the first row is NOT the header.
const rawData = [
  {
    "A": "SKU-0001"
  }
];

const getVal = (r, keys) => {
  const rowKeys = Object.keys(r);
  for (const k of keys) {
     const kNorm = k.normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
     const foundKey = rowKeys.find(rk => {
       const rkNorm = rk.replace(/\|/g, '').trim().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
       if (!rkNorm) return false;
       return rkNorm === kNorm || rkNorm.includes(kNorm) || kNorm.includes(rkNorm);
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

console.log("Desc:", getVal(rawData[0], ['description', 'descricao', 'descrição', 'produto']));
console.log("Cat:", getVal(rawData[0], ['category', 'categoria']));
