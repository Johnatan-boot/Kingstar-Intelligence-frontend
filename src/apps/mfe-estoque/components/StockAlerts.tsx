import { useState, useEffect } from 'react';
import { AlertTriangle, Clock, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import { stockApi } from '../../../services/api';

interface StockAlert {
  id: string;
  type: 'CRITICO' | 'RUPTURA' | 'ATENCAO';
  sku: string;
  description: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  value?: number;
  dismissed?: boolean;
}

// Só existem estes 3 status no backend (coluna `estoque.status`), calculados
// automaticamente a cada movimentação. Não há dado de vencimento de lote ou
// de giro/obsolescência no banco hoje, então os tipos VENCIMENTO/GIRO_BAIXO
// que existiam aqui (mockados) foram removidos — mostrar isso exigiria um
// campo de validade e um cálculo de giro que o schema ainda não tem.
const ALERT_CONFIG = {
  CRITICO: { icon: AlertTriangle, color: '#ef4444', bg: '#ef444418', label: 'Estoque Crítico' },
  RUPTURA: { icon: XCircle, color: '#dc2626', bg: '#dc262618', label: 'Ruptura' },
  ATENCAO: { icon: Clock, color: '#facc15', bg: '#facc1518', label: 'Atenção' },
};

function mapSeveridade(status: string): 'high' | 'medium' | 'low' {
  if (status === 'RUPTURA' || status === 'CRITICO') return 'high';
  return 'medium';
}

export default function StockAlerts() {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    stockApi.alertas().then(res => {
      const dados = res.data.dados as Array<{ sku_id: string; description: string; status: string; quantity: number }>;
      setAlerts(dados.map(d => ({
        id: d.sku_id,
        type: (d.status as StockAlert['type']) ?? 'ATENCAO',
        sku: d.sku_id,
        description: d.description,
        message: d.status === 'RUPTURA'
          ? 'Estoque zerado — sem disponibilidade para pedidos'
          : `Quantidade atual: ${d.quantity} un.`,
        severity: mapSeveridade(d.status),
        value: d.quantity,
      })));
    }).catch(() => setAlerts([]));
  }, []);

  const visible = alerts.filter(a => !dismissed.has(a.id));
  const high = visible.filter(a => a.severity === 'high').length;
  const medium = visible.filter(a => a.severity === 'medium').length;
  const low = visible.filter(a => a.severity === 'low').length;

  const dismiss = (id: string) => setDismissed(prev => new Set([...prev, id]));
  const dismissAll = () => setDismissed(new Set(alerts.map(a => a.id)));

  if (visible.length === 0) {
    return (
      <div style={{
        background: '#1a1a1a',
        borderRadius: '12px',
        border: '1px solid #242424',
        padding: '32px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
      }}>
        <div style={{ background: '#22c55e18', padding: '16px', borderRadius: '50%', border: '1px solid #22c55e30' }}>
          <CheckCircle size={28} color="#22c55e" />
        </div>
        <p style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>Nenhum alerta ativo</p>
        <p style={{ fontSize: '13px', color: '#8b9dc3' }}>Todos os itens estão dentro dos parâmetros normais</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{
        background: '#1a1a1a',
        borderRadius: '12px',
        border: '1px solid #242424',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
      }}>
        <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
          {high > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px #ef4444' }} />
              <span style={{ fontSize: '13px', color: '#ef4444', fontWeight: 600 }}>{high} crítico{high > 1 ? 's' : ''}</span>
            </div>
          )}
          {medium > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#facc15' }} />
              <span style={{ fontSize: '13px', color: '#facc15', fontWeight: 600 }}>{medium} atenção</span>
            </div>
          )}
          {low > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#8b9dc3' }} />
              <span style={{ fontSize: '13px', color: '#8b9dc3', fontWeight: 600 }}>{low} info</span>
            </div>
          )}
        </div>
        <button
          onClick={dismissAll}
          style={{ fontSize: '12px', color: '#8b9dc3', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px' }}
        >
          Dispensar todos
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {visible.map(alert => {
          const cfg = ALERT_CONFIG[alert.type];
          const Icon = cfg.icon;
          return (
            <div
              key={alert.id}
              style={{
                background: cfg.bg,
                border: `1px solid ${cfg.color}30`,
                borderLeft: `3px solid ${cfg.color}`,
                borderRadius: '12px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
              }}
            >
              <div style={{ marginTop: '1px' }}>
                <Icon size={16} color={cfg.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0, color: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', background: `${cfg.color}22`, color: cfg.color, padding: '1px 7px', borderRadius: '4px', fontWeight: 700 }}>
                    {cfg.label}
                  </span>
                  <span style={{ fontSize: '12px', fontFamily: 'monospace', color: cfg.color, fontWeight: 600 }}>
                    {alert.sku}
                  </span>
                  <span style={{ fontSize: '12px', color: '#e5e5e5' }}>{alert.description}</span>
                </div>
                <p style={{ fontSize: '13px', color: '#fff', marginBottom: '4px' }}>{alert.message}</p>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button
                  style={{
                    fontSize: '12px', color: cfg.color, background: `${cfg.color}15`,
                    border: `1px solid ${cfg.color}30`, cursor: 'pointer',
                    padding: '4px 10px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px',
                  }}
                >
                  Ver <ChevronRight size={12} />
                </button>
                <button
                  onClick={() => dismiss(alert.id)}
                  style={{
                    fontSize: '12px', color: '#8b9dc3', background: 'none',
                    border: '1px solid #333', cursor: 'pointer',
                    padding: '4px 8px', borderRadius: '6px',
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
