/**
 * Camada Domain (Domain-Driven Design)
 * Regras de Negócio puras e Entidades Raízes
 */
export class InventoryItem {
  constructor(
    public readonly sku: string,
    public quantity: number,
    public readonly location: string
  ) {}

  public addStock(amount: number): void {
    if (amount <= 0) {
      throw new Error('A quantidade para adicionar deve ser maior que zero.');
    }
    this.quantity += amount;
  }
}
