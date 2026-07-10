import { EstoqueAppService } from '../../application/services/EstoqueApp.service';
import { EventBus } from '../../../../infra/messaging/EventBus';

/**
 * Camada Infrastructure: Controller / Port de Entrada
 * Assim como um REST Controller atende HTTP, este Controller atende Mensagens e Eventos.
 */
export class EstoqueEventController {
  private estoqueService: EstoqueAppService;

  constructor() {
    this.estoqueService = new EstoqueAppService();
    this.setupRoutes();
  }

  // Roteador de mensageria
  private setupRoutes() {
    console.log('[WMS Core] EstoqueEventController inicializado. Aguardando eventos...');
    EventBus.subscribe('CONFERENCIA_CONCLUIDA', this.onConferenciaConcluida.bind(this));
  }

  // DTO Verification & Routing
  private onConferenciaConcluida(rawData: any) {
    console.log('[EstoqueEventController] Evento recebido. Validando DTO...');

    // Validação superficial da camada de infraestrutura/transporte (Controller)
    if (!rawData.sku || rawData.qtdTotal === undefined) {
      console.warn('[EstoqueEventController] Erro de contrato (Bad Request)! Faltam dados.');
      return;
    }

    // Passas o DTO limpo para a camada de Aplicação (Service)
    setTimeout(() => {
      this.estoqueService.registrarEntrada(rawData);
    }, 1500); // Simulando delay de rede/banco
  }
}
