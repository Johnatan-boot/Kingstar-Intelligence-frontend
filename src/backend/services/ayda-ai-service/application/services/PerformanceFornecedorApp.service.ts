import toast from 'react-hot-toast';
import { EventBus } from '../../../../infra/messaging/EventBus';

export class PerformanceFornecedorAppService {
  public analisarPadraoRecebimento(data: any) {
    console.log(`[Ayda AI App Service] Computando métricas de série temporal para o Forn: ${data.fornecedorId}`);

    // Emula processamento de Embedding ou Machine Learning (ChromaDB / Pinecone)
    toast('🤖 [Ayda AI]: Análise de Dados apontou que este Fornecedor descarregou 15% mais rápido.', {
      icon: '🧠',
      duration: 6000,
      style: { borderLeft: '4px solid #38bdf8' }
    });

    EventBus.publish('ESTATISTICA_FORNECEDOR_APRENDIDA', { fornecedorId: data.fornecedorId, delta: -0.15 });
  }
}
