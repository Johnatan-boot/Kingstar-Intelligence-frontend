const fs = require('fs');
const file = 'src/services/api.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/id: \\`pcl-\\\$\{conf.id\}\\`,/g, 'id: `pcl-${conf.id}`,');

fs.writeFileSync(file, content);
