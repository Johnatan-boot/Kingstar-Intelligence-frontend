// src/services/api.ts
//
// Camada de integração com o backend real (Fastify + MySQL). Antes,
// todo este arquivo trabalhava em cima de arrays em memória (mock);
// agora cada função chama o endpoint correspondente da API e adapta a
// resposta para o mesmo formato que as telas já esperavam, para não
// precisar reescrever cada componente que consome esses dados.
//
// Módulos sem endpoint real no backend (fornecedores/skus "catálogo" e
// agendamentos) continuam com dados de apoio (mock) — estão marcados
// abaixo com um comentário "SEM BACKEND".
import { http } from './httpClient';

// ── Compras (Pedidos) ──────────────────────────────────────────────
function mapPedido(p: any) {
  return {
    id: p.id,
    nf_number: p.numeroNf ?? '',
    supplier_name: p.fornecedorNome ?? '',
    status: p.status,
    created_at: p.dataPedido,
    ordered_at: p.dataPedido,
    nf_value: p.nfValue ?? null,
    items: (p.itens ?? []).map((i: any) => ({
      sku_id: i.sku,
      description: i.descricao,
      expected_quantity: i.quantidadeEsperada,
      unit_cost: i.unitCost ?? 0,
    })),
  };
}

export const purchasesApi = {
  list: async (params?: any) => {
    const res = await http.get('/compras', { params });
    return { data: { dados: (res.data.data ?? []).map(mapPedido) } };
  },
  // SEM BACKEND: não existe catálogo de fornecedores dedicado — o campo
  // fornecedor é texto livre em pedidos_compra. Mantido como apoio de UI.
  suppliers: async () => ({ data: { dados: [{ id: '1', nome_fantasia: 'Fornecedor Premium SA' }, { id: '2', nome_fantasia: 'Distribuidora ABC' }] } }),
  // SEM BACKEND: idem para catálogo de SKUs de compra.
  skus: async () => ({ data: { dados: [{ id: '1', codigo: 'COL-ORTO-001', descricao: 'Colchão Ortopédico Casal' }, { id: '2', codigo: 'TRV-MEM-002', descricao: 'Travesseiro Memory Foam' }] } }),
  create: async (data: any) => {
    const body = {
      fornecedorNome: data.supplierName || 'Fornecedor Novo',
      fornecedorId: data.supplierId || 'SEM_CODIGO',
      numeroNf: data.nfNumber,
      observacoes: data.observacoes,
      itens: (data.items ?? []).map((i: any) => ({
        sku: i.skuId,
        descricao: i.description,
        quantidadeEsperada: i.expectedQuantity,
      })),
    };
    const res = await http.post('/compras', body);
    return { data: { message: 'Criado com sucesso', id: res.data.data?.id } };
  },
  // Importação real da planilha XLSX (POST /compras/importar, multipart)
  importar: async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    const res = await http.post('/compras/importar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  cancel: async (id: string, _reason?: string) => {
    const res = await http.patch(`/compras/${id}/cancelar`);
    return { data: { message: res.data.message ?? 'Cancelado' } };
  },
};

// ── Recebimento ─────────────────────────────────────────────────────
function mapRecebimento(r: any) {
  return {
    id: r.id,
    purchase_order_id: r.pedidoCompraId,
    supplier_name: r.fornecedorNome ?? '',
    nf_number: r.numeroNf ?? '',
    license_plate: r.placaVeiculo ?? '',
    vehicle_type: r.tipoVeiculo,
    driver_name: r.nomeMotorista ?? '',
    dock: r.doca ?? '',
    start_time: r.horaInicio,
    end_time: r.horaFim,
    status: r.status,
    po_status: r.status === 'COMPLETED' ? 'CONFERENCE' : 'RECEIVING',
  };
}

export const receivingApi = {
  list: async (params?: any) => {
    const res = await http.get('/recebimento', { params });
    return { data: { dados: (res.data.data ?? []).map(mapRecebimento) } };
  },
  start: async (data: any) => {
    const body = {
      pedidoCompraId: data.purchaseOrderId,
      placaVeiculo: data.licensePlate,
      tipoVeiculo: data.vehicleType || 'TRUCK',
      nomeMotorista: data.driverName,
      doca: data.dock,
      numeroNf: data.nfNumber,
      fornecedorNome: data.supplierName,
      observacoes: data.observacoes,
    };
    const res = await http.post('/recebimento', body);
    return { data: { message: 'Recebimento criado', id: res.data.data?.id } };
  },
  // Necessário chamar antes de iniciar a conferência (o backend só cria
  // conferência para recebimentos já finalizados).
  finish: async (id: string) => {
    const res = await http.patch(`/recebimento/${id}/finalizar`);
    return { data: { message: res.data.message ?? 'Recebimento finalizado' } };
  },
};

// ── Conferência ──────────────────────────────────────────────────────
function mapConferencia(c: any) {
  return {
    id: c.id,
    recebimento_id: c.recebimentoId,
    purchase_order_id: c.pedidoCompraId,
    total_pieces: c.totalPecas,
    checked_pieces: c.pecasConferidas,
    damages: c.avarias,
    attempts: c.tentativas,
    status: c.status === 'PCL_ANALYSIS' ? 'PCL_ANALYSIS' : c.status,
  };
}

export const conferenceApi = {
  list: async (params?: any) => {
    const res = await http.get('/conferencia', params ? { params } : undefined);
    return { data: { dados: (res.data.data ?? []).map(mapConferencia) } };
  },
  start: async (data: any) => {
    const body = {
      recebimentoId: data.receivingId,
      pedidoCompraId: data.purchaseOrderId,
      totalPecas: data.totalPieces,
    };
    const res = await http.post('/conferencia', body);
    return { data: { message: 'Conferência iniciada', conference: mapConferencia(res.data.data) } };
  },
  submit: async (id: string, data: any) => {
    const body = {
      pecasConferidas: data.checkedPieces,
      avarias: data.damages ?? 0,
      observacoes: data.damageType,
    };
    const res = await http.patch(`/conferencia/${id}/submeter`, body);
    return { data: { status: res.data.data?.status } };
  },
};

// ── PCL (divergências) ───────────────────────────────────────────────
function mapDivergencia(d: any) {
  return {
    id: d.id,
    purchase_order_id: d.pedidoCompraId,
    total_pieces: d.totalPecas,
    checked_pieces: d.pecasConferidas,
    damages: d.avarias,
    attempts: d.tentativas,
    error_type: d.avarias > 0 ? 'AVARIA_MERCADORIA' : 'DIVERGENCIA_CONTAGEM',
    status: 'IN_ANALYSIS',
  };
}

export const pclApi = {
  list: async (_params?: any) => {
    const res = await http.get('/conferencia/pcl/divergencias');
    return { data: { dados: (res.data.data ?? []).map(mapDivergencia) } };
  },
  analyze: async (id: string, data: { approved: boolean; notes: string }) => {
    const res = await http.patch(`/conferencia/pcl/${id}/analisar`, {
      decisao: data.approved ? 'APPROVE' : 'REJECT',
      justificativa: data.notes,
    });
    return { data: { message: res.data.message ?? 'Análise registrada' } };
  },
};

// ── Estoque ───────────────────────────────────────────────────────────
function mapSaldoEstoque(s: any) {
  return {
    sku_id: s.sku,
    description: s.descricao,
    category: s.categoria ?? 'Geral',
    quantity_physical: Number(s.quantidadeFisica ?? 0),
    quantity_reserved: Number(s.quantidadeReservada ?? 0),
    quantity_available: Number(s.quantidadeDisponivel ?? 0),
    average_cost: Number(s.custoMedio ?? 0),
    total_value: Number(s.valorTotal ?? 0),
    status: s.status,
    location_code: s.localizacao ?? undefined,
    zone: s.zona ?? undefined,
    last_movement_at: s.ultimaMovimentacao ?? undefined,
  };
}

function mapMovimentacaoEstoque(m: any) {
  return {
    id: m.id,
    movement_type: m.tipo,
    sku_id: m.sku,
    quantity: Number(m.quantidade ?? 0),
    reference_type: m.referenciaId ?? m.motivo ?? '',
    occurred_at: m.criadoEm,
  };
}

export const stockApi = {
  dashboard: async () => {
    const res = await http.get('/estoque/dashboard');
    const d = res.data.data;
    return {
      data: {
        totalSkus: d.totalSkus,
        totalPieces: d.totalPecas,
        availableStock: d.totalPecas,
        criticalItems: d.totalCriticos + d.totalRupturas,
        totalValue: d.valorTotal,
      },
    };
  },
  abc: async () => {
    const res = await http.get('/estoque/curva-abc');
    return { data: res.data.data ?? [] };
  },
  // GET /estoque/saldos — posição real de estoque por SKU (paginado)
  saldos: async (params?: { page?: number; limit?: number; search?: string; status?: string; zona?: string }) => {
    const res = await http.get('/estoque/saldos', { params });
    const body = res.data;
    return { data: { dados: (body.data ?? []).map(mapSaldoEstoque), total: body.total, page: body.page, totalPages: body.totalPages } };
  },
  // GET /estoque/alertas — SKUs em CRITICO/RUPTURA/ATENCAO
  alertas: async () => {
    const res = await http.get('/estoque/alertas');
    return { data: { dados: (res.data.data ?? []).map((a: any) => ({ sku_id: a.sku, description: a.descricao, status: a.status, quantity: Number(a.quantidade ?? 0), average_cost: Number(a.custoMedio ?? 0) })) } };
  },
  // GET /estoque/localizacoes — endereços cadastrados de fato no banco
  localizacoes: async () => {
    const res = await http.get('/estoque/localizacoes');
    return { data: { dados: res.data.data ?? [] } };
  },
  // GET /estoque/movimentacoes — histórico real (substitui o mock anterior)
  movimentacoes: async (params?: { page?: number; limit?: number; sku?: string }) => {
    const res = await http.get('/estoque/movimentacoes', { params });
    const body = res.data;
    return { data: { dados: (body.data ?? []).map(mapMovimentacaoEstoque), total: body.total, page: body.page, totalPages: body.totalPages } };
  },
  // POST /estoque/movimentar — registra entrada/saída/reserva/etc.
  // IMPORTANTE: os nomes de campo aqui têm que bater com movimentarEstoqueSchema
  // no backend (sku, tipo, quantidade, motivo, referenciaId) — o bug anterior
  // mandava {type, skuId, locationId, quantity, unitCost, reason} sem tradução
  // nenhuma, e toda movimentação falhava com 400.
  move: async (data: { type: string; skuId: string; quantity: number; reason?: string; referenceId?: string; description?: string }) => {
    const body = {
      sku: data.skuId,
      descricao: data.description,
      tipo: data.type,
      quantidade: data.quantity,
      motivo: data.reason,
      referenciaId: data.referenceId,
    };
    const res = await http.post('/estoque/movimentar', body);
    return { data: { message: res.data.message } };
  },
  // POST /estoque/ajuste-lote — usado pela importação de planilha de estoque
  ajusteLote: async (itens: Array<{ sku: string; descricao?: string; quantidade: number }>) => {
    const res = await http.post('/estoque/ajuste-lote', { itens });
    return { data: { message: res.data.message } };
  },
  // PATCH /estoque/mover — transferir SKU para outra localização
  mover: async (data: { sku: string; localizacaoOrigem?: string; localizacaoDestino: string; quantidade?: number }) => {
    const res = await http.patch('/estoque/mover', data);
    return { data: { message: res.data.message } };
  },
};

// ── Agendamentos ────────────────────────────────────────────────────
// SEM BACKEND: a tabela `agendamentos` existe no banco, mas este pacote
// do backend ainda não expõe um módulo/rotas para ela. Mantido como
// mock até que esse módulo seja implementado no servidor.
let mockSchedules: any[] = [
  { id: '1', supplier_name: 'Fornecedor Premium SA', nf_number: '1234', expected_at: new Date().toISOString(), status: 'SCHEDULED' },
];

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
    return { data: { message: 'Agendamento criado (modo local — módulo de agendamentos ainda não existe no backend)' } };
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

// ── Analytics (AYDA Core + Analytics) ────────────────────────────────
// 100% real e em tempo real: os componentes fazem polling a cada 5s
// em cima destes endpoints, então basta devolver a resposta do axios
// tal como está — `res.data` já é `{ success, data }` no formato que
// os componentes (KpiCards, VolumeTimeline, StatusPie, AnalyticsMfe)
// já esperavam (`res.data.data`).
export const analyticsApi = {
  dashboard: async () => http.get('/analytics/dashboard'),
  volumeTimeline: async (dias = 14) => http.get('/analytics/volume-timeline', { params: { dias } }),
  registrarSnapshot: async (tipo: 'ALMOCO' | 'FECHAMENTO') => http.post('/analytics/snapshot', { tipo }),
};

// ── Usuários (Configurações → CRUD de usuários) ──────────────────────
// Restrito a perfis ADMIN/SUPER_ADMIN no backend.
function mapUsuario(u: any) {
  return {
    id: u.id,
    name: u.nome,
    email: u.email,
    dept: u.departamento || '—',
    role: u.funcao,
    status: u.ativo ? 'Ativo' : 'Inativo',
    lastLogin: u.ultimo_login,
  };
}

export const usuariosApi = {
  list: async (params?: { search?: string }) => {
    const res = await http.get('/usuarios', { params });
    return { data: { dados: (res.data.data ?? []).map(mapUsuario) } };
  },
  create: async (data: { name: string; email: string; password: string; role: string; dept: string }) => {
    const res = await http.post('/usuarios', {
      nome: data.name,
      email: data.email,
      senha: data.password,
      funcao: data.role,
      departamento: data.dept,
    });
    return { data: { message: res.data.message, usuario: mapUsuario(res.data.data) } };
  },
  update: async (id: string, data: Partial<{ name: string; email: string; password: string; role: string; dept: string; active: boolean }>) => {
    const body: any = {};
    if (data.name !== undefined) body.nome = data.name;
    if (data.email !== undefined) body.email = data.email;
    if (data.password) body.senha = data.password;
    if (data.role !== undefined) body.funcao = data.role;
    if (data.dept !== undefined) body.departamento = data.dept;
    if (data.active !== undefined) body.ativo = data.active;
    const res = await http.patch(`/usuarios/${id}`, body);
    return { data: { message: res.data.message, usuario: mapUsuario(res.data.data) } };
  },
  // Desativa o usuário (soft delete no backend — preserva o histórico).
  remove: async (id: string) => {
    const res = await http.delete(`/usuarios/${id}`);
    return { data: { message: res.data.message } };
  },
};

// ── AYDA (chat) ───────────────────────────────────────────────────────
// O backend expõe /chat publicamente (orquestra o serviço Python
// LangGraph). Se o serviço Python não estiver no ar, devolvemos uma
// mensagem de erro amigável em vez de travar a UI.
export const aydaApi = {
  status: async () => {
    try {
      const res = await http.get('/chat/status');
      return { data: { dados: !!res.data?.data } };
    } catch {
      return { data: { dados: false } };
    }
  },
  chat: async (message: string, history: any[]) => {
    const body = {
      pergunta: message,
      historico: (history ?? []).map((h: any) => ({
        papel: h.role === 'user' ? 'user' : 'assistant',
        conteudo: h.text ?? h.conteudo ?? '',
      })),
    };
    const res = await http.post('/chat', body);
    const resposta = res.data?.data?.resposta ?? res.data?.data?.text ?? '';
    return { data: { dados: { resposta } } };
  },
};
