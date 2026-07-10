import toast from 'react-hot-toast';
import { InventoryItem } from '../../domain/entities/InventoryItem.entity';
import { AlocacaoEstoqueService } from '../../domain/services/AlocacaoEstoque.service';
import { EventBus } from '../../../../infra/messaging/EventBus';

/**
 * Camada Application: Application Service (Use Case)
 * Orquestra repositórios, APIs externas e Serviços de Domínio.
 */
export class EstoqueAppService {
  private alocacaoService: AlocacaoEstoqueService;

  constructor() {
    this.alocacaoService = new AlocacaoEstoqueService();
  }

  public registrarEntrada(data: any) {
    // 1. Traz a entidade de um repositório real ou a instancializa
    const novoItem = new InventoryItem(data.sku, 0, 'DOCA-01');

    // 2. Acioina a Regra de Negócio Pura na entidade
    novoItem.addStock(data.qtdTotal);

    // 3. Aciona o Serviço de Domínio para lógica mais complexa (ex: achar a prateleira certa)
    const local = this.alocacaoService.encontrarPosicaoIdeal(novoItem);

    // 4. Salva no banco (Simulado)
    console.log(`[WMS Core - Application Service] Item salvo na base de dados no local: ${local.endereco}. SKU: ${novoItem.sku}, Qtd: ${novoItem.quantity}`);
    
    toast.success(`📦 [WMS MS]: Estoque atualizado via Service na Posição ${local.endereco} (NF: ${data.nf})`, {
      duration: 5000,
      style: { borderLeft: '4px solid #f59e0b' }
    });

    // 5. Publica Evento do Domínio (Event Sourcing)
    EventBus.publish('ESTOQUE_ATUALIZADO', { sku: novoItem.sku, novaQtd: novoItem.quantity, posicao: local.endereco });
  }
}
