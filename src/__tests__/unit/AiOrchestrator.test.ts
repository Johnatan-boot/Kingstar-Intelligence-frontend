import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGenerateContent = vi.hoisted(() => vi.fn());

// Mock como classe ES5 para compatibilidade com `new GoogleGenAI()`
vi.mock('@google/genai', () => {
  function GoogleGenAI(this: any) {
    this.models = { generateContent: mockGenerateContent };
  }
  return { GoogleGenAI };
});

vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key-12345');

// Dynamic import depois dos mocks
const { AydaCoreService } = await import('../../services/ai/AiOrchestrator');

describe('AydaCoreService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateContent.mockResolvedValue({ text: 'Resposta analítica AYDA.' });
  });

  it('instancia sem parâmetros', () => {
    expect(new AydaCoreService()).toBeDefined();
  });

  it('instancia com onStateChange callback', () => {
    expect(new AydaCoreService(vi.fn())).toBeDefined();
  });

  it('retorna texto e provider quando API responde', async () => {
    const result = await new AydaCoreService().processRequest('Status');
    expect(result.text).toBe('Resposta analítica AYDA.');
    expect(result.provider).toContain('Gemini');
  });

  it('passa contexto na system instruction', async () => {
    await new AydaCoreService().processRequest('Análise', 'Doca 3 atrasada');
    expect(mockGenerateContent.mock.calls[0][0].config.systemInstruction)
      .toContain('Doca 3 atrasada');
  });

  it('usa modelo gemini-2.0-flash', async () => {
    await new AydaCoreService().processRequest('x');
    expect(mockGenerateContent.mock.calls[0][0].model).toBe('gemini-2.0-flash');
  });

  it('retorna fallback quando text está vazio', async () => {
    mockGenerateContent.mockResolvedValue({ text: '' });
    const result = await new AydaCoreService().processRequest('x');
    expect(result.text).toContain('Sem resposta');
  });

  it('temperatura analítica configurada em 0.3', async () => {
    await new AydaCoreService().processRequest('x');
    expect(mockGenerateContent.mock.calls[0][0].config.temperature).toBe(0.3);
  });

  it('lança erro se VITE_GEMINI_API_KEY ausente', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', '');
    await expect(new AydaCoreService().processRequest('x'))
      .rejects.toThrow('VITE_GEMINI_API_KEY');
    vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key-12345');
  });
});
