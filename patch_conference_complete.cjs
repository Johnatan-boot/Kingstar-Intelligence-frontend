const fs = require('fs');
const file = 'src/services/api.ts';
let content = fs.readFileSync(file, 'utf8');

// 1. Update conferenceApi.submit to mark PO as COMPLETED
content = content.replace(
  /conf\.status = 'APPROVED';/,
  `conf.status = 'APPROVED';
      const po = mockPos.find(p => p.id === conf.purchase_order_id);
      if (po) po.status = 'COMPLETED';`
);

// 2. Update analyticsApi to sync totalCompletedNFs with completed conferences
content = content.replace(
  /totalCompletedNFs: totalCompleted,/,
  `totalCompletedNFs: completedConferencesToday,`
);

fs.writeFileSync(file, content);
