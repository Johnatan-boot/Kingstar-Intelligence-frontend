const fs = require('fs');
const file = 'src/services/api.ts';
let content = fs.readFileSync(file, 'utf8');

// I also need to update mockPos to add the mocked POs so they sync. Let's do it inline:

content = content.replace(
  /let mockReceivings: any\[\] = \[[\s\S]*?\];/,
  `let mockReceivings: any[] = [
  { id: 'mock-rec-1', start_time: new Date().toISOString(), supplier_name: 'Fornecedor Premium SA', nf_number: '12345', license_plate: 'ABC-1234', vehicle_type: 'TRUCK', status: 'IN_PROGRESS', po_status: 'RECEIVING', purchase_order_id: '1' }
];`
);

fs.writeFileSync(file, content);
