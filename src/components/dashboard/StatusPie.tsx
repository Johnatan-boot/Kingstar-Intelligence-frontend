import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { analyticsApi } from '../../services/api';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  RECEIVING: 'Recebendo',
  CONFERENCE: 'Em Conferência',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#facc15',
  RECEIVING: '#38bdf8',
  CONFERENCE: '#8b5cf6',
  COMPLETED: '#22c55e',
  CANCELLED: '#ef4444',
};

export function StatusPie() {
  const [slices, setSlices] = useState<Array<{ name: string; value: number; color: string }>>([]);

  useEffect(() => {
    const fetch = () => {
      analyticsApi.dashboard().then(res => {
        const statusPizza: Array<{ status: string; total: number }> = res.data.data?.statusPizza ?? [];
        setSlices(
          statusPizza
            .filter(s => s.total > 0)
            .map(s => ({
              name: STATUS_LABELS[s.status] ?? s.status,
              value: s.total,
              color: STATUS_COLORS[s.status] ?? '#8b9dc3',
            }))
        );
      }).catch(() => {});
    };
    fetch();
    const interval = setInterval(fetch, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 flex flex-col h-full">
      <div className="mb-2">
        <h3 className="text-sm font-bold text-white tracking-wide">Status dos Pedidos</h3>
        <p className="text-xs text-[var(--text-muted)] mt-1">Distribuição em tempo real</p>
      </div>
      <div className="flex-1 min-h-[220px] flex items-center justify-center -ml-4">
        {slices.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={slices}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                dataKey="value"
                strokeWidth={0}
                cornerRadius={4}
                paddingAngle={2}
              >
                {slices.map((e, index) => <Cell key={`cell-${index}`} fill={e.color} />)}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#121212',
                  border: '1px solid #242424',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-xs text-[var(--text-muted)]">Sem pedidos registrados ainda</p>
        )}
      </div>
      <div className="flex flex-col gap-3 mt-4">
        {slices.map(s => (
          <div key={s.name} className="flex justify-between items-center bg-[#161616] py-2 px-3 rounded-lg border border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color, boxShadow: `0 0 8px ${s.color}60` }} />
              <span className="text-xs font-medium text-[#c0cad6]">{s.name}</span>
            </div>
            <span className="font-mono text-sm font-bold text-white">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
