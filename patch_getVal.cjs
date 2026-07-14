const fs = require('fs');
const file = 'src/apps/mfe-estoque/index.tsx';
let content = fs.readFileSync(file, 'utf8');

const newGetVal = `
        let processedData: any[] = [];
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
                   const obj: any = {};
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

        const getVal = (r: any, keys: string[]) => {
          const rowKeys = Object.keys(r);
          for (const k of keys) {
             const kNorm = k.normalize('NFD').replace(/[\\u0300-\\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
             const foundKey = rowKeys.find(rk => {
               const rkNorm = rk.trim().normalize('NFD').replace(/[\\u0300-\\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
               return rkNorm === kNorm || rkNorm.includes(kNorm) || kNorm.includes(rkNorm);
             });
             if (foundKey !== undefined && r[foundKey] !== undefined && r[foundKey] !== null && String(r[foundKey]).trim() !== '') return r[foundKey];
          }
          return undefined;
        };`;

// replace between "const rawData = XLSX.utils.sheet_to_json<any>(ws);" and "const parseFloatSafe ="
content = content.replace(
  /const rawData = XLSX\.utils\.sheet_to_json<any>\(ws\);[\s\S]*?const parseFloatSafe =/,
  "const rawData = XLSX.utils.sheet_to_json<any>(ws);\n" + newGetVal + "\n\n        const parseFloatSafe ="
);

content = content.replace(/rawData\.map\(\(row: any\)/, "processedData.map((row: any)");

fs.writeFileSync(file, content);
