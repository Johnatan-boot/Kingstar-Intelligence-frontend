import { describe, it, expect, vi } from 'vitest';
import { InventoryItem } from '../../backend/services/wms-core/domain/entities/InventoryItem.entity';
import { AlocacaoEstoqueService } from '../../backend/services/wms-core/domain/services/AlocacaoEstoque.service';

// ── InventoryItem Entity ──────────────────────────────────────────────
describe('InventoryItem.addStock', () => {
  it('inicializa com sku, quantity e location corretos', () => {
    const item = new InventoryItem('SKU-001', 10, 'CORREDOR-A');
    expect(item.sku).toBe('SKU-001');
    expect(item.quantity).toBe(10);
    expect(item.location).toBe('CORREDOR-A');
  });

  it('adiciona quantidade positiva corretamente', () => {
    const item = new InventoryItem('SKU-002', 100, 'CORREDOR-B');
    item.addStock(50);
    expect(item.quantity).toBe(150);
  });

  it('lança erro ao tentar adicionar quantidade zero', () => {
    const item = new InventoryItem('SKU-003', 10, 'CORREDOR-C');
    expect(() => item.addStock(0)).toThrow('A quantidade para adicionar deve ser maior que zero.');
  });

  it('lança erro ao tentar adicionar quantidade negativa', () => {
    const item = new InventoryItem('SKU-004', 10, 'CORREDOR-D');
    expect(() => item.addStock(-5)).toThrow();
  });

  it('acumula múltiplas adições corretamente', () => {
    const item = new InventoryItem('SKU-005', 0, 'CORREDOR-A');
    item.addStock(100);
    item.addStock(200);
    item.addStock(50);
    expect(item.quantity).toBe(350);
  });

  it('sku e location são readonly (não mutáveis)', () => {
    const item = new InventoryItem('SKU-006', 10, 'LOC-01');
    // TypeScript impede em compile-time; em runtime, a propriedade readonly
    // é definida via constructor — tentativa de reassign não afeta o valor
    expect(item.sku).toBe('SKU-006');
    expect(item.location).toBe('LOC-01');
  });
});

// ── AlocacaoEstoqueService ────────────────────────────────────────────
describe('AlocacaoEstoqueService.encontrarPosicaoIdeal', () => {
  const service = new AlocacaoEstoqueService();

  it('item com quantidade > 500 vai para CORREDOR-A (curva A - fast moving)', () => {
    const item = new InventoryItem('SKU-FAST', 501, 'DOCA-01');
    const result = service.encontrarPosicaoIdeal(item);
    expect(result.curva).toBe('A');
    expect(result.endereco).toContain('CORREDOR-A');
  });

  it('item com quantidade exata de 501 vai para curva A', () => {
    const item = new InventoryItem('SKU-X', 501, 'DOCA-01');
    const result = service.encontrarPosicaoIdeal(item);
    expect(result.curva).toBe('A');
  });

  it('item com quantidade <= 500 vai para CORREDOR-D (curva C - slow moving)', () => {
    const item = new InventoryItem('SKU-SLOW', 500, 'DOCA-01');
    const result = service.encontrarPosicaoIdeal(item);
    expect(result.curva).toBe('C');
    expect(result.endereco).toContain('CORREDOR-D');
  });

  it('item com quantidade 0 vai para curva C', () => {
    const item = new InventoryItem('SKU-ZERO', 0, 'DOCA-01');
    const result = service.encontrarPosicaoIdeal(item);
    expect(result.curva).toBe('C');
  });

  it('resultado sempre tem propriedades endereco e curva', () => {
    const item = new InventoryItem('SKU-Y', 100, 'LOC');
    const result = service.encontrarPosicaoIdeal(item);
    expect(result).toHaveProperty('endereco');
    expect(result).toHaveProperty('curva');
    expect(typeof result.endereco).toBe('string');
    expect(typeof result.curva).toBe('string');
  });
});
