import { ConciliacaoNFeAppService } from '../../application/services/ConciliacaoNFeApp.service';
import { EventBus } from '../../../../infra/messaging/EventBus';

export class FinanceiroEventController {
  private conciliacaoService: ConciliacaoNFeAppService;

  constructor() {
    this.conciliacaoService = new ConciliacaoNFeAppService();
    this.setupRoutes();
  }

  private setupRoutes() {
    console.log('[Finance MS] FinanceiroEventController escutando barramento de notas...');
    EventBus.subscribe('CONFERENCIA_CONCLUIDA', this.onConferencia.bind(this));
  }

  private onConferencia(rawData: any) {
    if (!rawData.nf || !rawData.valorTotal) return;

    setTimeout(() => {
      this.conciliacaoService.provisionarContasAPagar(rawData);
    }, 4500); 
  }
}
