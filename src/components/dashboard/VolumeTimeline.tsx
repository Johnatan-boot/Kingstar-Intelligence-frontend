import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TIMELINE = Array.from({ length: 14 }, (_, i) => ({
  day: new Date(Date.now() - (13 - i) * 86400000).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
  pedidos: Math.floor(Math.random() * 30) + 10,
  recebimentos: Math.floor(Math.random() * 20) + 5,
  conferencias: Math.floor(Math.random() * 15) + 3,
}));

export function VolumeTimeline() {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 flex flex-col h-full">
      <div className="mb-6">
        <h3 className="text-sm font-bold text-white tracking-wide">Volume Operacional — 14 dias</h3>
        <p className="text-xs text-[var(--text-muted)] mt-1">Conferências, recebimentos e pedidos</p>
      </div>
      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={TIMELINE} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
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
            <Line type="monotone" dataKey="pedidos" stroke="#38bdf8" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#38bdf8', stroke: '#1a1a1a', strokeWidth: 3 }} name="Pedidos" />
            <Line type="monotone" dataKey="recebimentos" stroke="#22c55e" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#22c55e', stroke: '#1a1a1a', strokeWidth: 3 }} name="Recebimentos" />
            <Line type="monotone" dataKey="conferencias" stroke="#8b5cf6" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#1a1a1a', strokeWidth: 3 }} name="Conferências" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
