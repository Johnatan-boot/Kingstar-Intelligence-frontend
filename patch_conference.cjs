const fs = require('fs');
const file = 'src/services/api.ts';
let content = fs.readFileSync(file, 'utf8');

const regex = /start: async \(data: any\) => \{[\s\S]*?return \{ data: \{ message: 'Conferência iniciada', conference: newConf \} \};\s*\}/;

const replacement = `start: async (data: any) => {
    const newConf = {
      id: String(Date.now()),
      nf_number: data.nfNumber,
      purchase_order_id: data.purchaseOrderId,
      supplier_name: data.supplierName,
      total_pieces: data.totalPieces,
      vehicle_type: data.vehicleType,
      license_plate: data.licensePlate,
      attempts: 0,
      status: 'PENDING'
    };
    mockConferences.push(newConf);
    
    // Update receiving status
    if (data.receivingId) {
       const rec = mockReceivings.find(r => r.id === data.receivingId);
       if (rec) {
         rec.po_status = 'CONFERENCE';
         rec.status = 'COMPLETED'; // If receiving is done
       }
    }
    // Update PO status
    if (data.purchaseOrderId) {
       const po = mockPos.find(p => p.id === data.purchaseOrderId);
       if (po) po.status = 'CONFERENCE';
    }

    return { data: { message: 'Conferência iniciada', conference: newConf } };
  }`;

content = content.replace(regex, replacement);
fs.writeFileSync(file, content);
