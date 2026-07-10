/**
 * Serviço de integração com o AYDA AI Service (FastAPI/LangGraph).
 * Substitui o mock aydaApi em api.ts.
 *
 * Endpoint: POST /api/v1/chat
 * Body:     { pergunta: string, session_id: string }
 * Response: { resposta: string, ferramentas_usadas: string[], metadados: {} }
 */

const AYDA_URL = import.meta.env.VITE_AYDA_URL ?? 'http://localhost:8000';

let sessionId = `front_${Date.now()}`;

export const aydaService = {
  /** Verifica se o serviço está online */
  status: async (): Promise<boolean> => {
    try {
      const res = await fetch(`${AYDA_URL}/health`, { signal: AbortSignal.timeout(3000) });
      return res.ok;
    } catch {
      return false;
    }
  },

  /** Envia mensagem e retorna resposta do agente */
  chat: async (pergunta: string): Promise<{ resposta: string; ferramentas: string[] }> => {
    const res = await fetch(`${AYDA_URL}/api/v1/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pergunta, session_id: sessionId }),
    });

    if (!res.ok) {
      throw new Error(`AYDA respondeu ${res.status}`);
    }

    const data = await res.json();
    return {
      resposta: data.resposta ?? 'Sem resposta.',
      ferramentas: data.ferramentas_usadas ?? [],
    };
  },

  /** Reseta a sessão (nova conversa) */
  resetSession: () => {
    sessionId = `front_${Date.now()}`;
  },
};
