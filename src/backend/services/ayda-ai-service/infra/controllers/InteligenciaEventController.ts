import { PerformanceFornecedorAppService } from '../../application/services/PerformanceFornecedorApp.service';
import { EventBus } from '../../../../infra/messaging/EventBus';

export class InteligenciaEventController {
  private analiseService: PerformanceFornecedorAppService;

  constructor() {
    this.analiseService = new PerformanceFornecedorAppService();
    this.setupRoutes();
  }

  private setupRoutes() {
    console.log('[Ayda AI] InteligenciaEventController inicializado...');
    EventBus.subscribe('CONFERENCIA_CONCLUIDA', this.onConferencia.bind(this));
  }

  private onConferencia(rawData: any) {
    if (!rawData.fornecedorId) return;

    setTimeout(() => {
      this.analiseService.analisarPadraoRecebimento(rawData);
    }, 3000);
  }
}
