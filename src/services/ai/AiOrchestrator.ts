/// <reference types="vite/client" />
import { GoogleGenAI } from '@google/genai';
import { env } from '../../../../kingstar-intelligence-backend/src/shared/config/env';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class AydaCoreService {
  private onStateChange?: (state: any) => void;

  constructor(onStateChange?: (state: any) => void) {
    this.onStateChange = onStateChange;
  }

  async processRequest(prompt: string, context?: string): Promise<{ text: string; provider: string }> {
    // ✅ Usa import.meta.env (correto para Vite/browser)
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('VITE_GEMINI_API_KEY não configurada no .env do frontend.');
    }

    // ✅ Instanciado aqui dentro — não no topo do módulo
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `
      Você é a AYDA (Artificial Yield & Data Analytics), a Inteligência Operacional Logística Autônoma do ERP KingStar WMS.
      Responda de forma analítica, direta e estratégica em português corporativo.
      Use termos como Lead Time, Fill Rate, Picking, Putaway, Cross-docking quando relevante.

      Contexto operacional atual:
      ${context || 'Nenhum contexto ativo informado.'}
    `;

    // ✅ Modelo correto (gemini-3.1-pro-preview não existe)
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });

    return { text: response.text || 'Sem resposta do modelo.', provider: 'Gemini 2.0 Flash' };
  }
}

export const aydaService = new AydaCoreService();