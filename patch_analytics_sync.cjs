const fs = require('fs');
const file = 'src/services/api.ts';
let content = fs.readFileSync(file, 'utf8');

const regex = /const totalPending = mockPos.filter\(p => p.status === 'PENDING'\).length;/;
const replacement = `const totalPending = mockPos.filter(p => p.status === 'PENDING').length;`;

content = content.replace(regex, replacement);
fs.writeFileSync(file, content);
