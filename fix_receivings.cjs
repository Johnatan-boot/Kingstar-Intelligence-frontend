const fs = require('fs');
const file = 'src/apps/mfe-recebimento/index.tsx';
let content = fs.readFileSync(file, 'utf8');

// Find the messed up line and replace it
content = content.replace(
  /\{receivings\.filter\(rec => rec\.po_status !== 'CONFERENCE' \{receivings\.map\(rec => \(\{receivings\.map\(rec => \( rec\.po_status !== 'COMPLETED'\)\.map\(rec => \(/,
  "{receivings.filter(rec => rec.po_status !== 'CONFERENCE' && rec.po_status !== 'COMPLETED').map(rec => ("
);

fs.writeFileSync(file, content);
