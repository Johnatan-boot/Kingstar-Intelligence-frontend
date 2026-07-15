import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { analyticsApi } from '../../services/api';

export function VolumeTimeline() {
  const [data, setData] = useState<Array<{ day: string; minimo: number; maximo: number }>>([]);

  useEffect(() => {
    const fetch = () => {
      analyticsApi.dashboard().then(res => {
        const history: Array<{ date: string; minimo: number; maximo: number }> = res.data.data?.history ?? [];
        setData(history.map(h => ({
          day: new Date(h.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          minimo: h.minimo,
          maximo: h.maximo,
        })));
      }).catch(() => {});
    };
    fetch();
    const interval = setInterval(fetch, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 flex flex-col h-full">
      <div className="mb-6">
        <h3 className="text-sm font-bold text-white tracking-wide">Volume de Conferências — 14 dias</h3>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Mínimo (registrado no almoço) e máximo (registrado no fechamento) de pedidos conferidos por dia
        </p>
      </div>
      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#242424" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: '#8b9dc3' }}
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#8b9dc3' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: '#121212',
                border: '1px solid #242424',
                borderRadius: '12px',
                fontSize: '12px',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)'
              }}
              itemStyle={{ padding: '2px 0' }}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: '#8b9dc3' }} />
            <Bar dataKey="minimo" name="Mínimo (almoço)" fill="#38bdf8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="maximo" name="Máximo (fechamento)" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
