import { http } from './http';

/**
 * Camada de API do frontend — agora conectada ao backend real (Fastify).
 *
 * Regra de ouro: cada função mantém a MESMA assinatura e o MESMO formato de
 * retorno que as telas já consomem (ex.: `{ data: { dados: [...] } }`), para
 * não exigir nenhuma mudança nos componentes nem na estilização.
 *
 * O backend responde sempre no formato { success, data, total?, page?, ... }.
 * Aqui mapeamos os campos camelCase do backend para os nomes que cada tela lê.
 *
 * ⚠️ MOCK MANTIDO (não há endpoint no backend ainda): suppliers, skus,
 *    scheduleApi, analyticsApi, aydaApi. Marcados com TODO.
 */

// Extrai a lista de itens de uma resposta paginada do backend.
const lista = (resp: any): any[] => resp?.data?.data ?? resp?.data?.dados ?? [];

// ───────────────────────────── COMPRAS ─────────────────────────────
export const purchasesApi = {
  list: async (params?: any) => {
    const resp = await http.get('/compras', { params });
    const dados = lista(resp).map((p: any) => ({
      id: p.id,
      nf_number: p.numeroNf,
      supplier_name: p.fornecedorNome,
      supplier_id: p.fornecedorId,
      status: p.status,
      created_at: p.dataPedido,
      ordered_at: p.dataPedido,
      nf_value: p.valorNf ?? 0,
      observacoes: p.observacoes,
      items: p.itens ?? [],
    }));
    return { data: { dados } };
  },

  // TODO: backend ainda não expõe /fornecedores — mantido mock.
  suppliers: async () => ({
    data: { dados: [
      { id: '1', nome_fantasia: 'Fornecedor Premium SA' },
      { id: '2', nome_fantasia: 'Distribuidora ABC' },
    ] },
  }),

  // TODO: backend ainda não expõe /skus — mantido mock.
  skus: async () => ({
    data: { dados: [
      { id: '1', codigo: 'COL-ORTO-001', descricao: 'Colchão Ortopédico Casal' },
      { id: '2', codigo: 'TRV-MEM-002', descricao: 'Travesseiro Memory Foam' },
    ] },
  }),

  create: async (data: any) => {
    const payload = {
      fornecedorNome: data.supplierName || data.fornecedorNome || 'Fornecedor Novo',
      fornecedorId: data.supplierId || data.fornecedorId || 'SEM_CODIGO',
      numeroNf: data.nfNumber || data.numeroNf,
      observacoes: data.observacoes,
      itens: (data.items ?? data.itens ?? []).map((i: any) => ({
        sku: i.skuId ?? i.sku,
        descricao: i.description ?? i.descricao,
        quantidadeEsperada: i.expectedQuantity ?? i.quantidadeEsperada ?? i.quantidade,
      })),
    };
    const resp = await http.post('/compras', payload);
    return { data: resp.data };
  },

  cancel: async (id: string, _reason?: string) => {
    const resp = await http.patch(`/compras/${id}/cancelar`);
    return { data: resp.data };
  },
};

// ──────────────────────────── RECEBIMENTO ──────────────────────────
export const receivingApi = {
  list: async (params?: any) => {
    const resp = await http.get('/recebimento', { params });
    const dados = lista(resp).map((r: any) => ({
      id: r.id,
      purchase_order_id: r.pedidoCompraId,
      supplier_name: r.fornecedorNome,
      nf_number: r.numeroNf,
      license_plate: r.placaVeiculo,
      vehicle_type: r.tipoVeiculo,
      driver_name: r.nomeMotorista,
      start_time: r.horaInicio,
      end_time: r.horaFim,
      status: r.status,
      po_status: r.status,
    }));
    return { data: { dados } };
  },

  start: async (data: any) => {
    const payload = {
      pedidoCompraId: data.purchaseOrderId ?? data.pedidoCompraId,
      placaVeiculo: data.licensePlate ?? data.placaVeiculo,
      tipoVeiculo: data.vehicleType ?? data.tipoVeiculo ?? 'TRUCK',
      nomeMotorista: data.driverName ?? data.nomeMotorista,
      doca: data.dock ?? data.doca,
      numeroNf: data.nfNumber ?? data.numeroNf,
      fornecedorNome: data.supplierName ?? data.fornecedorNome,
      observacoes: data.observacoes,
    };
    const resp = await http.post('/recebimento', payload);
    return { data: resp.data };
  },

  finish: async (id: string) => {
    const resp = await http.patch(`/recebimento/${id}/finalizar`);
    return { data: resp.data };
  },
};

// ──────────────────────────── CONFERÊNCIA ──────────────────────────
export const conferenceApi = {
  list: async (params?: any) => {
    const resp = await http.get('/conferencia', { params });
    const dados = lista(resp).map((c: any) => ({
      id: c.id,
      recebimento_id: c.recebimentoId,
      purchase_order_id: c.pedidoCompraId,
      total_pieces: c.totalPecas,
      checked_pieces: c.pecasConferidas,
      attempts: c.tentativas ?? 0,
      status: c.status,
      created_at: c.criadoEm,
    }));
    return { data: { dados } };
  },

  start: async (data: any) => {
    const payload = {
      recebimentoId: data.recebimentoId ?? data.receivingId,
      pedidoCompraId: data.purchaseOrderId ?? data.pedidoCompraId,
      totalPecas: data.totalPieces ?? data.totalPecas,
    };
    const resp = await http.post('/conferencia', payload);
    return { data: { message: 'Conferência iniciada', conference: resp.data?.data } };
  },

  submit: async (id: string, data: any) => {
    const payload = {
      pecasConferidas: data.checkedPieces ?? data.pecasConferidas,
      avarias: data.damages ?? data.avarias ?? 0,
      observacoes: data.observacoes,
    };
    const resp = await http.patch(`/conferencia/${id}/submeter`, payload);
    const status = resp.data?.data?.status ?? resp.data?.status;
    return { data: { status } };
  },
};

// ──────────────────────────────── PCL ──────────────────────────────
export const pclApi = {
  list: async (params?: any) => {
    const resp = await http.get('/conferencia/pcl/divergencias', { params });
    const dados = lista(resp).map((d: any) => ({
      id: d.id,
      purchase_order_id: d.pedidoCompraId,
      total_pieces: d.totalPecas,
      checked_pieces: d.pecasConferidas,
      damages: d.avarias,
      attempts: d.tentativas ?? 0,
      status: d.status,
    }));
    return { data: { dados } };
  },

  analyze: async (id: string, data: { approved: boolean; notes: string }) => {
    const payload = {
      decisao: data.approved ? 'APPROVE' : 'REJECT',
      justificativa: data.notes,
    };
    const resp = await http.patch(`/conferencia/pcl/${id}/analisar`, payload);
    return { data: resp.data };
  },
};

// ──────────────────────────────── ESTOQUE ──────────────────────────
export const stockApi = {
  dashboard: async () => {
    const resp = await http.get('/estoque/dashboard');
    const d = resp.data?.data ?? {};
    return {
      data: {
        totalSkus: d.totalSkus ?? 0,
        totalPieces: d.totalPecas ?? 0,
        availableStock: d.totalPecas ?? 0,
        criticalItems: d.totalCriticos ?? 0,
        totalValue: d.valorTotal ?? 0,
      },
    };
  },

  abc: async () => {
    const resp = await http.get('/estoque/curva-abc');
    return { data: resp.data?.data ?? [] };
  },

  move: async (data: any) => {
    // Movimento entre localizações → /estoque/mover; senão movimentação genérica.
    if (data?.localizacaoDestino || data?.destino) {
      const resp = await http.patch('/estoque/mover', {
        sku: data.sku,
        localizacaoOrigem: data.localizacaoOrigem ?? data.origem,
        localizacaoDestino: data.localizacaoDestino ?? data.destino,
        quantidade: data.quantidade ?? data.quantity,
      });
      return { data: resp.data };
    }
    const resp = await http.post('/estoque/movimentar', {
      sku: data.sku,
      descricao: data.descricao ?? data.description,
      tipo: data.tipo ?? data.type ?? 'ADJUSTMENT',
      quantidade: data.quantidade ?? data.quantity,
      motivo: data.motivo ?? data.reason,
      referenciaId: data.referenciaId ?? data.referenceId,
    });
    return { data: { movementId: resp.data?.data?.movementId ?? resp.data?.movementId, ...resp.data } };
  },
};

// ════════════════════════════════════════════════════════════════════
//  ABAIXO: ainda SEM endpoint no backend — mantidos como mock (TODO).
// ════════════════════════════════════════════════════════════════════

let mockSchedules: any[] = [
  { id: '1', supplier_name: 'Fornecedor Premium SA', nf_number: '1234', expected_at: new Date().toISOString(), status: 'SCHEDULED' },
];

// TODO: criar módulo de Agendamento no backend.
export const scheduleApi = {
  list: async () => ({ data: { dados: mockSchedules } }),
  create: async (data: any) => {
    mockSchedules.push({
      id: String(Date.now()),
      supplier_name: data.supplierName,
      nf_number: data.nfNumber,
      expected_at: data.expectedAt,
      notes: data.notes,
      status: 'SCHEDULED',
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
  },
};

// TODO: criar endpoint de analytics/score no backend.
export const analyticsApi = {
  dashboard: async () => {
    await new Promise(r => setTimeout(r, 300));
    return {
      data: {
        data: {
          metrics: {
            totalCompletedNFs: 0, totalVehiclesReceived: 0, totalPiecesChecked: 0,
            errorRate: 0, totalDamages: 0, totalDivergences: 0,
            avgReceivingMin: 0, avgConferenceMin: 0,
          },
          score: { total: 0, classification: '—' },
          history: [],
          supplierScores: [],
          kpis: { completed_pos: 0, conference_pos: 0, receiving_pos: 0, pending_pos: 0, cancelled_pos: 0 },
        },
      },
    };
  },
};

// TODO: o chat IA (AYDA) usa o Gemini direto no frontend (AiOrchestrator).
// Este mock cobre o status/chat enquanto não há endpoint dedicado.
export const aydaApi = {
  status: async () => ({ data: { dados: true } }),
  chat: async (message: string, _history: any[]) => {
    await new Promise(r => setTimeout(r, 500));
    return { data: { dados: { resposta: 'Assistente em modo local. Pergunte sobre as operações da Kingstar.' } } };
  },
};
