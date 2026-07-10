import { EstoqueEventController } from './services/wms-core/infra/controllers/EstoqueEventController';
import { InteligenciaEventController } from './services/ayda-ai-service/infra/controllers/InteligenciaEventController';
import { FinanceiroEventController } from './services/finance-service/infra/controllers/FinanceiroEventController';

/**
 * Bootstrap de Inicialização dos Micro-serviços
 * Instancia os Controllers que ficarão escutando o Barramento de Eventos via EventBus / Kafka.
 */
export function bootstrapBackend() {
  console.groupCollapsed('🚀 Bootstrapping Backend Microservices (Domain-Driven Design)');
  new EstoqueEventController();
  new InteligenciaEventController();
  new FinanceiroEventController();
  console.groupEnd();
}
