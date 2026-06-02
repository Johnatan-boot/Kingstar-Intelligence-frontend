/**
 * EventBus — Message Broker simulado (client-side).
 *
 * Implementa um padrão pub/sub simples para comunicação desacoplada entre os
 * microfrontends (MFEs). Antes vivia no backend; foi movido para o frontend
 * para manter a separação de responsabilidades sem dependência de pasta externa.
 *
 * API:
 *   - subscribe(topic, handler) -> retorna função de unsubscribe
 *   - publish(topic, payload)   -> entrega o payload a todos os handlers do tópico
 */

type Handler = (payload: any) => void;

class MessageBroker {
  // Mantido como `topics` (Record) — a suíte de testes acessa esta estrutura.
  private topics: Record<string, Handler[]> = {};

  subscribe(topic: string, handler: Handler): () => void {
    if (!this.topics[topic]) {
      this.topics[topic] = [];
    }
    this.topics[topic].push(handler);

    // Retorna a função de cancelamento de inscrição.
    return () => {
      this.topics[topic] = (this.topics[topic] || []).filter((h) => h !== handler);
    };
  }

  publish(topic: string, payload: any): void {
    const handlers = this.topics[topic];
    if (!handlers || handlers.length === 0) {
      return; // Nenhum subscriber: não faz nada (e não lança erro).
    }

    // Dispara de forma assíncrona, simulando a entrega de um broker de mensagens.
    handlers.forEach((handler) => {
      setTimeout(() => handler(payload), 0);
    });
  }
}

export const EventBus = new MessageBroker();
