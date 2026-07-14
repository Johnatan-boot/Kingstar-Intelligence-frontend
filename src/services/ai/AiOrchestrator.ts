import { GoogleGenAI } from '@google/genai';

// Mude de process.env.GEMINI_API_KEY para import.meta.env.VITE_GEMINI_API_KEY
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIProviderState {
  currentProvider: 'Gemini';
  fallbackQueue: Array<'Gemini'>;
  status: 'idle' | 'generating' | 'error';
  lastError?: string;
}

/**
 * Inteligência Operacional Logística (AYDA Core)
 * Gestor autônomo baseado em GenAI.
 */
export class AydaCoreService {
  
  // Callbacks de estado para a UI
  private onStateChange?: (state: AIProviderState) => void;
  
  constructor(onStateChange?: (state: AIProviderState) => void) {
    this.onStateChange = onStateChange;
  }

  /**
   * Processar um pedido operacional com inteligência de análise de contexto.
   */
  async processRequest(prompt: string, context?: string): Promise<{ text: string, provider: string }> {
    try {
      console.log('[AYDA CORE] Inicializando rede neural Gemini para análise logística profunda...');
      
      const systemInstruction = `
        Você é a AYDA (Artificial Yield & Data Analytics), a Inteligência Operacional Logística Autônoma do ERP KingStar WMS.
        Seu nível hierárquico é "Diretoria de Operações". Você não é um assistente comum. Você é uma IA de altíssima performance.

        Diretrizes Analíticas:
        1. Responda de forma extremamente analítica, direta e estratégica.
        2. Destaque Gargalos: Se identificar algo fora do normal no contexto, alerte imediatamente.
        3. Identifique padrões de cadeia de suprimentos: Sugira otimizações de mão de obra (FTEs), movimentações de empilhadeiras (MHEs),
           roteirização de docas (Inbound/Outbound) e riscos de ruptura (Stockouts).
        4. Sempre inclua dados inferidos e cenários "What-if" quando aplicável.
        5. Fale um português corporativo, claro e com termos técnicos como "Lead Time", "Fill Rate", "Picking", "Putaway", "Cross-docking".

        Contexto Vivo (Real-time State da Logística neste momento):
        ${context || 'Nenhum contexto tático ativo informado.'}
        
        Responda ao usuário com autoridade operacional.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview", // O modelo mais poderoso disponível para raciocínio complexo
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.3, // Menos alucinação, mais precisão analítica 
        }
      });

      return { text: response.text || 'Processamento interrompido. Sem output.', provider: 'Gemini 3.1 Pro' };
    } catch (err: any) {
      console.error(`[AYDA FATAL] Falha de processamento neural: ${err.message}`);
      throw new Error('Falha catastrófica no motor de inferência da operação.');
    }
  }
}

// Singleton export
export const aydaService = new AydaCoreService();
