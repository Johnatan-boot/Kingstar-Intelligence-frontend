const fs = require('fs');
const file = 'src/apps/mfe-ayda/index.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /Volume Diário Atual: 85% de uso da malha./,
  `Volume Diário Atual: 85% de uso da malha.`
);

fs.writeFileSync(file, content);
