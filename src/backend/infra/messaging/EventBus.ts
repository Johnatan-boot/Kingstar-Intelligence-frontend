// src/backend/infra/messaging/EventBus.ts

type EventHandler = (payload: any) => void;

/**
 * Infraestrutura: Simulador de Barramento de Mensagens (ex: Kafka, RabbitMQ, SQS)
 * Utiliza o padrão Publisher/Subscriber para desacoplar os microserviços.
 */
class MessageBroker {
  private topics: Record<string, EventHandler[]> = {};

  publish(topic: string, payload: any) {
    console.log(`%c[KAFKA BINDING] 📥 Mensagem enviada para o tópico: ${topic}`, 'color: #f59e0b; font-weight: bold;');
    
    if (!this.topics[topic]) {
      console.warn(`[MessageBroker] Nenhum subscriber escutando o tópico: ${topic}`);
      return;
    }

    // Assíncrono (Event-driven puro, em thread separada virtualizada no JS)
    this.topics[topic].forEach(handler => {
      setTimeout(() => handler(payload), 0);
    });
  }

  subscribe(topic: string, handler: EventHandler) {
    if (!this.topics[topic]) {
      this.topics[topic] = [];
    }
    
    this.topics[topic].push(handler);
    console.log(`%c[KAFKA BINDING] 👂 Microserviço inscrito no tópico: ${topic}`, 'color: #10b981;');

    return () => {
      this.topics[topic] = this.topics[topic].filter(h => h !== handler);
    };
  }
}

export const EventBus = new MessageBroker();
