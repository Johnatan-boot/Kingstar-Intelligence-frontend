import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const STATUS_PIE = [
  { name: 'Concluído', value: 45, color: '#22c55e' },
  { name: 'Em andamento', value: 23, color: '#38bdf8' },
  { name: 'Pendente', value: 18, color: '#facc15' },
  { name: 'Atrasado', value: 4,  color: '#ef4444' },
];

export function StatusPie() {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 flex flex-col h-full">
      <div className="mb-2">
        <h3 className="text-sm font-bold text-white tracking-wide">Status dos Pedidos</h3>
        <p className="text-xs text-[var(--text-muted)] mt-1">Distribuição atual</p>
      </div>
      <div className="flex-1 min-h-[220px] flex items-center justify-center -ml-4">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie 
              data={STATUS_PIE} 
              cx="50%" 
              cy="50%" 
              innerRadius={55}
              outerRadius={80} 
              dataKey="value" 
              strokeWidth={0}
              cornerRadius={4}
              paddingAngle={2}
            >
              {STATUS_PIE.map((e, index) => <Cell key={`cell-${index}`} fill={e.color} />)}
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
      </div>
      <div className="flex flex-col gap-3 mt-4">
        {STATUS_PIE.map(s => (
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
