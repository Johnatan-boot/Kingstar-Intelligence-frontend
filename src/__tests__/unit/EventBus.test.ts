import { describe, it, expect, vi, beforeEach } from 'vitest';

// Bypassa o mock global do setup.ts — usamos a implementação real do EventBus
const { EventBus } = await vi.importActual<typeof import('../../backend/infra/messaging/EventBus')>(
  '../../backend/infra/messaging/EventBus'
);

describe('EventBus (MessageBroker)', () => {
  beforeEach(() => {
    // Limpar tópicos entre testes (acesso via cast)
    (EventBus as any).topics = {};
  });

  it('subscribe registra handler no tópico', () => {
    const handler = vi.fn();
    EventBus.subscribe('TEST_TOPIC', handler);
    expect((EventBus as any).topics['TEST_TOPIC']).toHaveLength(1);
  });

  it('publish chama handler registrado no tópico', async () => {
    const handler = vi.fn();
    EventBus.subscribe('PEDIDO_CRIADO', handler);
    EventBus.publish('PEDIDO_CRIADO', { id: 'p1' });
    await new Promise(r => setTimeout(r, 10));
    expect(handler).toHaveBeenCalledWith({ id: 'p1' });
  });

  it('múltiplos handlers no mesmo tópico são todos chamados', async () => {
    const h1 = vi.fn(), h2 = vi.fn();
    EventBus.subscribe('RECEBIMENTO_INICIADO', h1);
    EventBus.subscribe('RECEBIMENTO_INICIADO', h2);
    EventBus.publish('RECEBIMENTO_INICIADO', { id: 'r1' });
    await new Promise(r => setTimeout(r, 10));
    expect(h1).toHaveBeenCalledOnce();
    expect(h2).toHaveBeenCalledOnce();
  });

  it('publish em tópico sem subscribers não lança erro', () => {
    expect(() => EventBus.publish('TOPICO_VAZIO', {})).not.toThrow();
  });

  it('unsubscribe remove handler do tópico', async () => {
    const handler = vi.fn();
    const unsubscribe = EventBus.subscribe('CONFERENCIA_INICIADA', handler);
    unsubscribe();
    EventBus.publish('CONFERENCIA_INICIADA', {});
    await new Promise(r => setTimeout(r, 10));
    expect(handler).not.toHaveBeenCalled();
  });

  it('payload é passado corretamente ao handler', async () => {
    const handler = vi.fn();
    const payload = { nf: 'NF-001', fornecedor: 'ABC', itens: 5 };
    EventBus.subscribe('NF_CONFERIDA', handler);
    EventBus.publish('NF_CONFERIDA', payload);
    await new Promise(r => setTimeout(r, 10));
    expect(handler).toHaveBeenCalledWith(payload);
  });

  it('subscribe retorna função de unsubscribe válida', () => {
    const unsub = EventBus.subscribe('TOPICO', vi.fn());
    expect(typeof unsub).toBe('function');
    expect(() => unsub()).not.toThrow();
  });

  it('tópicos independentes não interferem entre si', async () => {
    const h1 = vi.fn(), h2 = vi.fn();
    EventBus.subscribe('TOPICO_A', h1);
    EventBus.subscribe('TOPICO_B', h2);
    EventBus.publish('TOPICO_A', { evento: 'A' });
    await new Promise(r => setTimeout(r, 10));
    expect(h1).toHaveBeenCalledOnce();
    expect(h2).not.toHaveBeenCalled();
  });
});
