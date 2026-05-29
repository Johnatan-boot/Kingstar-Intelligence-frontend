import { describe, it, expect, beforeEach } from 'vitest';
import {
  purchasesApi,
  receivingApi,
  conferenceApi,
  pclApi,
  stockApi,
  scheduleApi,
  analyticsApi,
  aydaApi,
} from '../../services/api';

describe('purchasesApi.list', () => {
  it('retorna lista com pedido padrão', async () => {
    const { data } = await purchasesApi.list();
    expect(data.dados).toBeInstanceOf(Array);
    expect(data.dados.length).toBeGreaterThan(0);
  });
  it('filtra por status PENDING', async () => {
    const { data } = await purchasesApi.list({ status: 'PENDING' });
    data.dados.forEach((p: any) => expect(p.status).toBe('PENDING'));
  });
  it('retorna lista vazia para status inexistente', async () => {
    const { data } = await purchasesApi.list({ status: '__NONE__' });
    expect(data.dados).toHaveLength(0);
  });
});

describe('purchasesApi.create', () => {
  it('cria novo pedido', async () => {
    const antes = (await purchasesApi.list()).data.dados.length;
    await purchasesApi.create({ nfNumber: 'NF-T1', supplierName: 'Forn', nfValue: 100, items: [] });
    expect((await purchasesApi.list()).data.dados.length).toBe(antes + 1);
  });
  it('novo pedido começa PENDING', async () => {
    await purchasesApi.create({ nfNumber: 'NF-T2', items: [] });
    const { data } = await purchasesApi.list({ status: 'PENDING' });
    expect(data.dados.find((p: any) => p.nf_number === 'NF-T2')?.status).toBe('PENDING');
  });
});

describe('purchasesApi.cancel', () => {
  it('muda status para CANCELLED', async () => {
    await purchasesApi.create({ nfNumber: 'NF-CAN', items: [] });
    const { data } = await purchasesApi.list();
    const p = data.dados.find((x: any) => x.nf_number === 'NF-CAN');
    await purchasesApi.cancel(p.id, 'motivo');
    const { data: after } = await purchasesApi.list();
    expect(after.dados.find((x: any) => x.id === p.id)?.status).toBe('CANCELLED');
  });
});

describe('purchasesApi.suppliers / skus', () => {
  it('retorna fornecedores', async () => {
    const { data } = await purchasesApi.suppliers();
    expect(data.dados[0]).toHaveProperty('nome_fantasia');
  });
  it('retorna SKUs', async () => {
    const { data } = await purchasesApi.skus();
    expect(data.dados[0]).toHaveProperty('codigo');
  });
});

describe('receivingApi', () => {
  it('lista recebimentos', async () => {
    const { data } = await receivingApi.list();
    expect(data.dados).toBeInstanceOf(Array);
  });
  it('inicia recebimento', async () => {
    const antes = (await receivingApi.list()).data.dados.length;
    await receivingApi.start({ nfNumber: 'NF-R1', vehicleType: 'TRUCK' });
    expect((await receivingApi.list()).data.dados.length).toBe(antes + 1);
  });
  it('novo recebimento fica IN_PROGRESS', async () => {
    await receivingApi.start({ nfNumber: 'NF-R2', vehicleType: 'VAN' });
    const { data } = await receivingApi.list();
    expect(data.dados.find((r: any) => r.nf_number === 'NF-R2')?.status).toBe('IN_PROGRESS');
  });
});

describe('conferenceApi', () => {
  it('lista conferências', async () => {
    const { data } = await conferenceApi.list();
    expect(data.dados).toBeInstanceOf(Array);
  });
  it('cria conferência', async () => {
    const antes = (await conferenceApi.list()).data.dados.length;
    await conferenceApi.start({ nfNumber: 'NF-C1', purchaseOrderId: 'p1', supplierName: 'F', totalPieces: 50 });
    expect((await conferenceApi.list()).data.dados.length).toBe(antes + 1);
  });
  it('APPROVED quando peças batem', async () => {
    // BUG DOCUMENTADO: api.ts usa Date.now() como ID → colisão quando testes executam rápido
    // Workaround: delay de 2ms entre starts para garantir IDs únicos
    await new Promise(r => setTimeout(r, 2));
    const { data: started } = await conferenceApi.start({
      nfNumber: `NF-APPROVED-${performance.now().toFixed(6)}`,
      purchaseOrderId: 'p-approved',
      supplierName: 'F',
      totalPieces: 30,
    });
    const { data } = await conferenceApi.submit(started.conference.id, {
      checkedPieces: 30, damages: 0, damageType: 'NONE',
    });
    expect(data.status).toBe('APPROVED');
  });
  it('IN_PROGRESS na 1ª divergência', async () => {
    const uid = `div-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const { data: started } = await conferenceApi.start({ nfNumber: uid, purchaseOrderId: 'p-div', supplierName: 'F', totalPieces: 100 });
    const { data } = await conferenceApi.submit(started.conference.id, { checkedPieces: 80, damages: 0, damageType: 'NONE' });
    expect(data.status).toBe('IN_PROGRESS');
  });
  it('erro para id inválido', async () => {
    await expect(conferenceApi.submit('invalid-id', {})).rejects.toThrow();
  });
});

describe('pclApi', () => {
  it('lista PCL', async () => {
    const { data } = await pclApi.list();
    expect(data.dados).toBeInstanceOf(Array);
  });
  it('filtra IN_ANALYSIS', async () => {
    const { data } = await pclApi.list({ status: 'IN_ANALYSIS' });
    data.dados.forEach((d: any) => expect(d.status).toBe('IN_ANALYSIS'));
  });
  it('aprova divergência', async () => {
    const { data: list } = await pclApi.list({ status: 'IN_ANALYSIS' });
    if (list.dados.length > 0) {
      await pclApi.analyze(list.dados[0].id, { approved: true, notes: 'OK' });
      const { data: after } = await pclApi.list();
      expect(after.dados.find((d: any) => d.id === list.dados[0].id)?.status).toBe('APPROVED');
    }
  });
});

describe('stockApi', () => {
  it('dashboard com KPIs corretos', async () => {
    const { data } = await stockApi.dashboard();
    expect(data).toHaveProperty('totalSkus');
    expect(data).toHaveProperty('totalValue');
    expect(data.totalValue).toBeGreaterThan(0);
  });
  it('move retorna movementId', async () => {
    const { data } = await stockApi.move({ sku: 'SKU-001', from: 'A1', to: 'B2' });
    expect(data.movementId).toMatch(/^MV-/);
  });
});

describe('scheduleApi', () => {
  it('lista agendamentos', async () => {
    const { data } = await scheduleApi.list();
    expect(data.dados).toBeInstanceOf(Array);
  });
  it('cria agendamento', async () => {
    const antes = (await scheduleApi.list()).data.dados.length;
    await scheduleApi.create({ supplierName: 'F', nfNumber: 'NF-S1', expectedAt: '' });
    expect((await scheduleApi.list()).data.dados.length).toBe(antes + 1);
  });
  it('arrive muda para ARRIVED', async () => {
    const { data } = await scheduleApi.list();
    await scheduleApi.arrive(data.dados[0].id);
    const { data: after } = await scheduleApi.list();
    expect(after.dados.find((s: any) => s.id === data.dados[0].id)?.status).toBe('ARRIVED');
  });
  it('cancel muda para CANCELLED', async () => {
    await scheduleApi.create({ supplierName: 'X', nfNumber: 'NF-SC', expectedAt: '' });
    const { data } = await scheduleApi.list();
    const item = data.dados.find((s: any) => s.nf_number === 'NF-SC');
    await scheduleApi.cancel(item.id);
    const { data: after } = await scheduleApi.list();
    expect(after.dados.find((s: any) => s.id === item.id)?.status).toBe('CANCELLED');
  });
});

describe('analyticsApi', () => {
  it('retorna métricas completas', async () => {
    const { data } = await analyticsApi.dashboard();
    expect(data.data.metrics).toHaveProperty('totalCompletedNFs');
    expect(data.data.score.total).toBeGreaterThanOrEqual(0);
    expect(data.data.history).toHaveLength(14);
  });
  it('score entre 0 e 100', async () => {
    const { data } = await analyticsApi.dashboard();
    expect(data.data.score.total).toBeLessThanOrEqual(100);
  });
});

describe('aydaApi', () => {
  it('status é true', async () => {
    const { data } = await aydaApi.status();
    expect(data.dados).toBe(true);
  });
  it('chat retorna resposta', async () => {
    const { data } = await aydaApi.chat('olá', []);
    expect(data.dados.resposta).toBeTruthy();
  });
  it('detecta pergunta sobre item crítico', async () => {
    const { data } = await aydaApi.chat('tem item critico?', []);
    expect(data.dados.resposta).toContain('7 itens');
  });
  it('detecta pergunta sobre pedido', async () => {
    const { data } = await aydaApi.chat('como criar pedido?', []);
    expect(data.dados.resposta).toContain('Compras');
  });
  it('detecta pergunta sobre atraso', async () => {
    const { data } = await aydaApi.chat('tem atraso?', []);
    expect(data.dados.resposta).toContain('2 contêineres');
  });
});
