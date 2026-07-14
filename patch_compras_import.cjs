const fs = require('fs');
const file = 'src/services/api.ts';
let content = fs.readFileSync(file, 'utf8');

// Replace the create PO logic in mock to ALSO create mockReceivings to keep them in sync
content = content.replace(
  /create: async \(data: any\) => \{[\s\S]*?return \{ data: \{ message: 'Criado com sucesso' \} \};\s*\}/,
  `create: async (data: any) => {
    const newId = String(Date.now());
    mockPos.push({
      id: newId,
      nf_number: data.nfNumber,
      supplier_name: data.supplierName || 'Fornecedor Novo',
      status: 'PENDING',
      created_at: new Date().toISOString(),
      ordered_at: data.expectedAt || new Date().toISOString(),
      nf_value: data.nfValue,
      items: data.items.map((i: any) => ({
        sku_id: i.skuId,
        description: i.description,
        expected_quantity: i.expectedQuantity,
        unit_cost: i.unitCost
      }))
    });
    
    // Auto-create receiving to sync pending POs with receiving cars
    mockReceivings.push({
      id: \`rec-\${newId}\`,
      purchase_order_id: newId,
      supplier_name: data.supplierName || 'Fornecedor Novo',
      nf_number: data.nfNumber,
      license_plate: 'ABC-1234',
      vehicle_type: 'TRUCK',
      driver_name: 'Motorista Mock',
      dock: 'Doca 1',
      start_time: new Date().toISOString(),
      status: 'IN_PROGRESS',
      po_status: 'RECEIVING'
    });

    return { data: { message: 'Criado com sucesso' } };
  }`
);

fs.writeFileSync(file, content);
