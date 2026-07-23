import { describe, it, expect } from 'vitest';

// Teste de fumaça: garante que a infraestrutura de testes (vitest + jsdom)
// está corretamente configurada e funcionando neste projeto.
describe('infraestrutura de testes', () => {
  it('roda testes com ambiente jsdom disponivel', () => {
    expect(typeof document).toBe('object');
    expect(1 + 1).toBe(2);
  });
});
