import { InventoryItem } from '../entities/InventoryItem.entity';

/**
 * Camada Domain: Domain Service
 * Lida com regras de negócio que não cabem perfeitamente em apenas uma entidade.
 * Neste caso: O algoritmo para calcular onde a mercadoria deve ser guardada.
 */
export class AlocacaoEstoqueService {
  
  public encontrarPosicaoIdeal(item: InventoryItem): { endereco: string; curva: string } {
    console.log(`[WMS Core - Domain Service] Executando algoritmo de alocação de curva ABC para o item...`);
    
    // Regra imaginária fictícia
    if (item.quantity > 500) {
      return { endereco: 'CORREDOR-A-RACK-01', curva: 'A' }; // Fast-moving
    } else {
      return { endereco: 'CORREDOR-D-RACK-10', curva: 'C' }; // Slow-moving
    }
  }
}
