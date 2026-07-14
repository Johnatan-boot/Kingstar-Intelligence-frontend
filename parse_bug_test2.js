const r = {
  "| SKU      ": "| SKU-0001",
  "| Produto                         ": "Colchão Queen Molas Ensacadas",
  "|  Categoria ": "COLCHÕES"
};
const keys = ['description', 'descricao', 'descrição', 'produto'];
const locKeys = ['location_code', 'localizacao', 'localização'];

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
console.log("DESC:", getVal(r, keys));
console.log("LOC:", getVal(r, locKeys));
