const fs = require('fs');
const file = 'src/services/api.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /totalCompletedNFs: completedConferencesToday,/,
  `totalCompletedNFs: totalCompleted,`
);

fs.writeFileSync(file, content);
