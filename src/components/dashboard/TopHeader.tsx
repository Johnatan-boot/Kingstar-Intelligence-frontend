import React, { useState, useEffect } from 'react';

export function TopHeader() {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => { 
    const t = setInterval(() => setTime(new Date()), 1000); 
    return () => clearInterval(t); 
  }, []);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
          Core Operacional
        </h1>
        <p className="text-[#8b9dc3] mt-1 text-sm font-medium">
          Visão em tempo real — KingStar Intelligence v2
        </p>
      </div>
      <div className="text-left sm:text-right">
        <div className="font-mono text-2xl font-bold text-[#38bdf8] tracking-tight">
          {time.toLocaleTimeString('pt-BR')}
        </div>
        <div className="text-xs text-[#5a6a7a] font-medium uppercase tracking-wider mt-1">
          {time.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
        </div>
      </div>
    </div>
  );
}
