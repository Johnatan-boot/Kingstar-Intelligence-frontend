// src/hooks/useAydaChat.ts
//
// Hook único usado pelos dois lugares onde a Ayda aparece no frontend
// (o widget flutuante e a página mfe-ayda). Ele fala de verdade com o
// backend Fastify, que repassa para o agente Python (web-automate) via
// Server-Sent Events — é assim que dá para "ver" a automação acontecendo
// (ferramenta sendo chamada, resultado voltando) em vez de só a resposta
// final aparecer do nada depois de vários segundos.
import { useCallback, useRef, useState } from 'react';

export const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL || 'http://localhost:3333';

export type AydaStepStatus = 'rodando' | 'concluida' | 'erro';

export interface AydaStep {
  id: string;
  ferramenta: string;
  status: AydaStepStatus;
  resultadoPreview?: string;
}

export interface AydaMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  steps?: AydaStep[];
  isStreaming?: boolean;
}

interface HistoricoItem {
  papel: 'user' | 'assistant';
  conteudo: string;
}

/** Nomes amigáveis em pt-BR para as ferramentas/automações do agente. */
const NOMES_AMIGAVEIS: Record<string, string> = {
  buscar_conhecimento_logistica: 'Consultando base de conhecimento de logística',
  resumo_de_compras: 'Calculando resumo de compras',
  kpis_de_compras: 'Calculando KPIs de compras',
  pedidos_por_status: 'Buscando pedidos por status',
  pedidos_em_atraso: 'Verificando pedidos em atraso',
  volume_por_categoria: 'Calculando volume por categoria',
  pecas_a_chegar: 'Consultando peças a chegar',
  ranking_de_fornecedores: 'Montando ranking de fornecedores',
  agenda_de_chegada: 'Consultando agenda de chegada',
  alertar_equipe: 'Disparando alerta automático para a equipe (Make)',
};

export function nomeAmigavel(ferramenta: string): string {
  return NOMES_AMIGAVEIS[ferramenta] ?? `Executando automação: ${ferramenta}`;
}

export function useAydaChat(contexto?: { user_id?: string; nome?: string; funcao?: string }) {
  const [messages, setMessages] = useState<AydaMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [online, setOnline] = useState<boolean | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const checkStatus = useCallback(async () => {
    try {
      const resp = await fetch(`${API_BASE_URL}/chat/status`);
      const json = await resp.json();
      setOnline(Boolean(json?.data?.online));
    } catch {
      setOnline(false);
    }
  }, []);

  const send = useCallback(
    async (texto: string) => {
      const pergunta = texto.trim();
      if (!pergunta || loading) return;

      const historico: HistoricoItem[] = messages.slice(-8).map((m) => ({
        papel: m.role,
        conteudo: m.content,
      }));

      const userMsg: AydaMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: pergunta,
        timestamp: new Date(),
      };
      const assistantId = `a-${Date.now()}`;
      const assistantMsg: AydaMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        steps: [],
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setLoading(true);

      const controller = new AbortController();
      abortRef.current = controller;

      const patchAssistant = (patch: Partial<AydaMessage> | ((m: AydaMessage) => AydaMessage)) => {
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id !== assistantId) return m;
            return typeof patch === 'function' ? patch(m) : { ...m, ...patch };
          })
        );
      };

      try {
        const resp = await fetch(`${API_BASE_URL}/chat/stream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pergunta, historico, contexto }),
          signal: controller.signal,
        });

        if (!resp.ok || !resp.body) {
          throw new Error(`Backend respondeu ${resp.status}`);
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        // O SSE manda blocos separados por "\n\n"; cada bloco começa com "data: ".
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const blocos = buffer.split('\n\n');
          buffer = blocos.pop() ?? '';

          for (const bloco of blocos) {
            const linhaDados = bloco.split('\n').find((l) => l.startsWith('data:'));
            if (!linhaDados) continue;
            const jsonStr = linhaDados.replace(/^data:\s*/, '');
            if (!jsonStr || jsonStr === '{}') continue;

            let evento: { tipo: string; dados: any };
            try {
              evento = JSON.parse(jsonStr);
            } catch {
              continue;
            }

            if (evento.tipo === 'ferramenta_iniciada') {
              const stepId = `${assistantId}-${evento.dados.ferramenta}-${Date.now()}`;
              patchAssistant((m) => ({
                ...m,
                steps: [
                  ...(m.steps ?? []),
                  { id: stepId, ferramenta: evento.dados.ferramenta, status: 'rodando' },
                ],
              }));
            } else if (evento.tipo === 'ferramenta_concluida') {
              patchAssistant((m) => {
                const steps = [...(m.steps ?? [])];
                const idx = [...steps].reverse().findIndex(
                  (s) => s.ferramenta === evento.dados.ferramenta && s.status === 'rodando'
                );
                if (idx !== -1) {
                  const realIdx = steps.length - 1 - idx;
                  steps[realIdx] = {
                    ...steps[realIdx],
                    status: 'concluida',
                    resultadoPreview: evento.dados.resultado_preview,
                  };
                }
                return { ...m, steps };
              });
            } else if (evento.tipo === 'resposta_final') {
              patchAssistant({ content: evento.dados.resposta || '(sem resposta)', isStreaming: false });
            } else if (evento.tipo === 'erro') {
              patchAssistant({
                content: `⚠️ ${evento.dados.mensagem || 'Ocorreu um erro na automação.'}`,
                isStreaming: false,
              });
            }
          }
        }
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          patchAssistant({
            content:
              'Não consegui falar com o backend/serviço de automação agora. Confirme que o backend (porta 3333) e o web-automate (porta 8000) estão rodando.',
            isStreaming: false,
          });
        }
      } finally {
        setLoading(false);
        patchAssistant((m) => (m.isStreaming ? { ...m, isStreaming: false } : m));
      }
    },
    [messages, loading, contexto]
  );

  const clear = useCallback(() => setMessages([]), []);

  return { messages, send, loading, online, checkStatus, clear };
}
