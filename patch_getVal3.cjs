const fs = require('fs');
const file = 'src/apps/mfe-estoque/index.tsx';
let content = fs.readFileSync(file, 'utf8');

const newGetVal = `        const getVal = (r: any, keys: string[]) => {
          const rowKeys = Object.keys(r);
          for (const k of keys) {
             const kNorm = k.normalize('NFD').replace(/[\\u0300-\\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
             const foundKey = rowKeys.find(rk => {
               const rkNorm = rk.replace(/\\|/g, '').trim().normalize('NFD').replace(/[\\u0300-\\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
               if (!rkNorm) return false;
               return rkNorm === kNorm || (kNorm.length >= 4 && rkNorm.includes(kNorm));
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
        };`;

content = content.replace(
  /const getVal = \(r: any, keys: string\[\]\) => \{[\s\S]*?return undefined;\s*\};/,
  newGetVal.trim()
);

fs.writeFileSync(file, content);
