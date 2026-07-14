let mockPos: any[] = [
  { 
    id: '1', 
    nf_number: '12345', 
    supplier_name: 'Fornecedor Premium SA', 
    status: 'PENDING', 
    created_at: new Date().toISOString(), 
    ordered_at: new Date().toISOString(),
    nf_value: 5000,
    items: [
      { sku_id: 'COL-ORTO-001', description: 'Colchão Ortopédico Casal', expected_quantity: 10, unit_cost: 450.0 }
    ] 
  }
];

let mockReceivings: any[] = [
  { id: 'mock-rec-1', start_time: new Date().toISOString(), supplier_name: 'Fornecedor Premium SA', nf_number: '12345', license_plate: 'ABC-1234', vehicle_type: 'TRUCK', status: 'IN_PROGRESS', po_status: 'RECEIVING', purchase_order_id: '1' }
];

export const purchasesApi = {
  list: async (params?: any) => {
    let list = mockPos;
    if (params?.status) {
      list = list.filter(p => p.status === params.status);
    }
    return { data: { dados: list } };
  },
  suppliers: async () => ({ data: { dados: [{id: '1', nome_fantasia: 'Fornecedor Premium SA'}, {id: '2', nome_fantasia: 'Distribuidora ABC'}] } }),
  skus: async () => ({ data: { dados: [{id: '1', codigo: 'COL-ORTO-001', descricao: 'Colchão Ortopédico Casal'}, {id: '2', codigo: 'TRV-MEM-002', descricao: 'Travesseiro Memory Foam'}] } }),
  create: async (data: any) => {
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
      id: `rec-${newId}`,
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
  },
  cancel: async (id: string, reason: string) => {
    const po = mockPos.find(p => p.id === id);
    if (po) po.status = 'CANCELLED';
    return { data: { message: 'Cancelado' } };
  }
};

export const receivingApi = {
  list: async () => ({ data: { dados: mockReceivings } }),
  start: async (data: any) => {
    const newId = String(Date.now());
    mockReceivings.push({
      id: newId,
      purchase_order_id: data.purchaseOrderId,
      supplier_name: data.supplierName,
      nf_number: data.nfNumber,
      license_plate: data.licensePlate,
      vehicle_type: data.vehicleType,
      driver_name: data.driverName,
      dock: data.dock,
      start_time: new Date().toISOString(),
      status: 'IN_PROGRESS',
      po_status: 'RECEIVING'
    });
    return { data: { message: 'Recebimento criado' } };
  }
};

let mockConferences: any[] = [
  { id: 'mock-conf-1', nf_number: '001', purchase_order_id: 'po1', supplier_name: 'Fornecedor Premium SA', total_pieces: 100, attempts: 0, status: 'PENDING' }
];

let mockPclDivergences: any[] = [
  { id: 'mock-pcl-1', nf_number: '001', supplier_name: 'Fornecedor A', error_type: 'DIVERGENCIA_CONTAGEM', total_pieces: 100, checked_pieces: 95, damages: 0, attempts: 3, status: 'IN_ANALYSIS' }
];

export const conferenceApi = {
  list: async () => ({ data: { dados: mockConferences } }),
  start: async (data: any) => {
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
  },
  submit: async (id: string, data: any) => {
    const conf = mockConferences.find(c => c.id === id);
    if (!conf) throw new Error('Not found');
    
    conf.attempts = (conf.attempts || 0) + 1;
    conf.checked_pieces = data.checkedPieces;
    conf.damages = data.damages;
    conf.has_damages = data.damageType === 'AVARIA';

    if (data.checkedPieces !== conf.total_pieces) {
      if (conf.attempts >= 3) {
        conf.status = 'PCL_ANALYSIS';
        mockPclDivergences.push({
          id: `pcl-${conf.id}`,
          nf_number: conf.nf_number,
          purchase_order_id: conf.purchase_order_id,
          supplier_name: conf.supplier_name,
          error_type: data.damageType === 'AVARIA' ? 'AVARIA_MERCADORIA' : 'DIVERGENCIA_CONTAGEM',
          total_pieces: conf.total_pieces,
          checked_pieces: data.checkedPieces,
          damages: data.damages,
          attempts: conf.attempts,
          status: 'IN_ANALYSIS'
        });
      } else {
        conf.status = 'IN_PROGRESS';
      }
    } else {
      conf.status = 'APPROVED';
      const po = mockPos.find(p => p.id === conf.purchase_order_id);
      if (po) po.status = 'COMPLETED';
    }
    
    return { data: { status: conf.status } };
  }
};

export const pclApi = {
  list: async (params?: any) => {
    let list = mockPclDivergences;
    if (params?.status) {
      if (params.status === 'IN_ANALYSIS') { 
        list = list.filter(p => p.status === 'IN_ANALYSIS');
      } else { 
        list = list.filter(p => p.status === params.status);
      }
    }
    return { data: { dados: list } };
  },
  analyze: async (id: string, data: { approved: boolean, notes: string }) => {
    const div = mockPclDivergences.find(d => d.id === id);
    if (div) {
      div.status = data.approved ? 'APPROVED' : 'REJECTED';
      div.notes = data.notes;
    }
    return { data: { message: 'Análise registrada' } };
  }
};

export const stockApi = {
  dashboard: async () => ({
    data: { totalSkus: 142, totalPieces: 38420, availableStock: 35100, criticalItems: 7, totalValue: 1240000 }
  }),
  abc: async () => ({
    data: [] // mock is generated inside component if empty
  }),
  move: async (data: any) => {
    return { data: { movementId: 'MV-' + Date.now() } };
  }
};

let mockSchedules: any[] = [
  { id: '1', supplier_name: 'Fornecedor Premium SA', nf_number: '1234', expected_at: new Date().toISOString(), status: 'SCHEDULED' }
];

export const scheduleApi = {
  list: async () => {
    return { data: { dados: mockSchedules } };
  },
  create: async (data: any) => {
    mockSchedules.push({
      id: String(Date.now()),
      supplier_name: data.supplierName,
      nf_number: data.nfNumber,
      expected_at: data.expectedAt,
      notes: data.notes,
      status: 'SCHEDULED'
    });
    return { data: { message: 'Agendamento criado' } };
  },
  arrive: async (id: string) => {
    const s = mockSchedules.find(x => x.id === id);
    if (s) s.status = 'ARRIVED';
    return { data: { message: 'Status atualizado' } };
  },
  cancel: async (id: string) => {
    const s = mockSchedules.find(x => x.id === id);
    if (s) s.status = 'CANCELLED';
    return { data: { message: 'Cancelado' } };
  }
};

export const analyticsApi = {
  dashboard: async () => {
    // Simulate delay
    await new Promise(r => setTimeout(r, 800));
    
    // Dynamic calculation
    const totalCompleted = mockPos.filter(p => p.status === 'COMPLETED').length;
    const totalPending = mockPos.filter(p => p.status === 'PENDING').length;
    const totalCancelled = mockPos.filter(p => p.status === 'CANCELLED').length;
    const totalReceiving = mockReceivings.filter(r => r.status === 'IN_PROGRESS').length;
    const totalConferences = mockConferences.length;
    
    const completedConferencesToday = mockConferences.filter(c => c.status === 'APPROVED').length;
    // O número de pedidos pendentes sempre será igual ao número de veículos em recebimento na interface
    const pedidosPendentesReal = mockReceivings.length;

    return {
      data: {
        data: {
          metrics: {
            totalCompletedNFs: totalCompleted,
            totalVehiclesReceived: mockReceivings.length,
            totalPiecesChecked: 15420,
            errorRate: 1.2,
            totalDamages: 8,
            totalDivergences: 12,
            avgReceivingMin: 45,
            avgConferenceMin: 82
          },
          score: {
            total: 92,
            classification: 'Excelente'
          },
          history: Array.from({ length: 14 }).map((_, i) => ({
            date: new Date(Date.now() - (13 - i) * 86400000).toISOString(),
            total: Math.floor(Math.random() * 50) + 10,
            completed: Math.floor(Math.random() * 40) + 10
          })),
          supplierScores: [
            { supplier: 'Fornecedor Premium SA', score: 98, totalDeliveries: 45, divergences: 0, avgDeliveryTime: 32 },
            { supplier: 'Distribuidora ABC', score: 85, totalDeliveries: 22, divergences: 3, avgDeliveryTime: 45 },
            { supplier: 'Industria XPTO', score: 65, totalDeliveries: 12, divergences: 5, avgDeliveryTime: 120 }
          ],
          kpis: {
            completed_pos: totalCompleted,
            conference_pos: totalConferences,
            receiving_pos: totalReceiving,
            pending_pos: pedidosPendentesReal,
            cancelled_pos: totalCancelled,
            completed_conferences_today: completedConferencesToday
          }
        }
      }
    };
  }
};

export const aydaApi = {
  status: async () => ({ data: { dados: true } }),
  chat: async (message: string, history: any[]) => {
    // Generate a contextual mock response
    let resposta = "Entendi. Como posso ajudar mais com as operações da Kingstar?";
    const msgLower = message.toLowerCase();
    
    if (msgLower.includes("critico") || msgLower.includes("crítico")) {
      resposta = "Atualmente temos **7 itens** em estoque crítico, a maioria na categoria de colchoes. Posso gerar um relatório detalhado se quiser.";
    } else if (msgLower.includes("pedido")) {
      resposta = "Para criar um pedido, você precisa ir na tela de **Compras / PCL**, clicar em 'Novo Pedido' e preencher o formulário. Posso te guiar passo a passo.";
    } else if (msgLower.includes("atrasad") || msgLower.includes("atraso")) {
      resposta = "No momento há **2 contêineres** atrasados aguardando recebimento na doca norte. Eles já foram sinalizados para o PCL.";
    }
    
    // Simulate delay
    await new Promise(r => setTimeout(r, 1000));
    return { data: { dados: { resposta } } };
  }
};
