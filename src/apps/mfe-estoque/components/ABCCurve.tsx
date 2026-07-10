import { useState, useEffect } from 'react';
import { stockApi } from '../../../services/api';
import { TrendingUp, Award, Minus } from 'lucide-react';

interface ABCItem {
  sku: string;
  description: string;
  totalValue: number;
  movements: number;
  classification: 'A' | 'B' | 'C';
}

const CLASS_CONFIG = {
  A: { color: '#38bdf8', bg: '#38bdf818', label: 'Classe A', desc: 'Alto giro / Alto valor', icon: Award },
  B: { color: '#facc15', bg: '#facc1518', label: 'Classe B', desc: 'Médio giro / Médio valor', icon: TrendingUp },
  C: { color: '#8b9dc3', bg: '#71717a18', label: 'Classe C', desc: 'Baixo giro / Baixo valor', icon: Minus },
};

const generateMockABC = (): ABCItem[] => {
  const items: ABCItem[] = [];
  const names = [
    'Colchão Casal Mola', 'Cama Box Baú Solteiro', 'Colchão Queen Espuma', 'Travesseiro Visco',
    'Cama Box King', 'Cabeceira Estofada', 'Protetor de Colchão', 'Colchão Solteiro D33',
    'Base Box Casal', 'Colchão Berço', 'Kit Cama Babá', 'Puff Decorativo',
    'Recamier Casal', 'Travesseiro Látex', 'Manta Microfibra', 'Edredom Casal',
    'Jogo de Lençol Queen', 'Saia para Box', 'Almofada Decorativa', 'Tapete Quarto',
  ];
  for (let i = 0; i < 20; i++) {
    const value = Math.pow(20 - i, 2) * 450 + Math.random() * 1000;
    items.push({
      sku: `SKU-${String(i + 1).padStart(4, '0')}`,
      description: names[i % names.length],
      totalValue: parseFloat(value.toFixed(2)),
      movements: Math.floor((20 - i) * 8 + Math.random() * 20),
      classification: i < 4 ? 'A' : i < 10 ? 'B' : 'C',
    });
  }
  return items;
};

export default function ABCCurve() {
  const [data, setData] = useState<ABCItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeClass, setActiveClass] = useState<'A' | 'B' | 'C' | 'ALL'>('ALL');

  useEffect(() => {
    stockApi.abc()
      .then((d: any) => setData(Array.isArray(d?.data) ? d.data : generateMockABC()))
      .catch(() => setData(generateMockABC()))
      .finally(() => setLoading(false));
  }, []);

  const totalValue = data.reduce((s, i) => s + i.totalValue, 0);

  const summary = (['A', 'B', 'C'] as const).map(cls => {
    const items = data.filter(d => d.classification === cls);
    const value = items.reduce((s, i) => s + i.totalValue, 0);
    const cfg = CLASS_CONFIG[cls];
    return { cls, items: items.length, value, pct: totalValue > 0 ? (value / totalValue) * 100 : 0, cfg };
  });

  const filtered = activeClass === 'ALL' ? data : data.filter(d => d.classification === activeClass);
  const maxValue = Math.max(...data.map(d => d.totalValue), 1);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#8b9dc3' }}>
        Calculando Curva ABC...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
        {summary.map(({ cls, items, value, pct, cfg }) => {
          const Icon = cfg.icon;
          const isActive = activeClass === cls;
          return (
            <button
              key={cls}
              onClick={() => setActiveClass(isActive ? 'ALL' : cls)}
              style={{
                background: isActive ? cfg.bg : '#1a1a1a',
                border: `1px solid ${isActive ? cfg.color : '#242424'}`,
                borderRadius: '12px',
                padding: '18px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ background: cfg.bg, padding: '7px', borderRadius: '8px', border: `1px solid ${cfg.color}30` }}>
                  <Icon size={16} color={cfg.color} />
                </div>
                <span style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'monospace', color: cfg.color }}>
                  {cls}
                </span>
              </div>
              <p style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'monospace', color: cfg.color }}>
                {pct.toFixed(1)}%
              </p>
              <p style={{ fontSize: '12px', color: '#8b9dc3', marginTop: '2px' }}>
                {items} SKUs · R$ {(value / 1000).toFixed(0)}k
              </p>
              <p style={{ fontSize: '11px', color: '#8b9dc3', marginTop: '4px' }}>{cfg.desc}</p>
            </button>
          );
        })}
      </div>

      <div style={{ background: '#1a1a1a', borderRadius: '12px', border: '1px solid #242424', padding: '20px' }}>
        <p style={{ fontSize: '12px', color: '#8b9dc3', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
          Distribuição de Valor por Classe
        </p>
        <div style={{ display: 'flex', height: '14px', borderRadius: '8px', overflow: 'hidden', gap: '2px' }}>
          {summary.map(({ cls, pct, cfg }) => (
            <div
              key={cls}
              style={{
                width: `${pct}%`,
                background: cfg.color,
                opacity: activeClass === 'ALL' || activeClass === cls ? 1 : 0.25,
                transition: 'all 0.3s',
                borderRadius: '4px',
                minWidth: pct > 0 ? '6px' : '0',
              }}
              title={`Classe ${cls}: ${pct.toFixed(1)}%`}
            />
          ))}
        </div>
        <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
          {summary.map(({ cls, pct, cfg }) => (
            <div key={cls} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: cfg.color }} />
              <span style={{ color: '#8b9dc3' }}>Classe {cls}: </span>
              <span style={{ color: cfg.color, fontWeight: 600, fontFamily: 'monospace' }}>{pct.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#1a1a1a', borderRadius: '12px', border: '1px solid #242424', padding: '20px' }}>
        <p style={{ fontSize: '12px', color: '#8b9dc3', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
          Top SKUs por Valor Consumido (90 dias) — {filtered.length} itens
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.slice(0, 15).map((item) => {
            const cfg = CLASS_CONFIG[item.classification];
            const barPct = (item.totalValue / maxValue) * 100;
            return (
              <div key={item.sku} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '80px', flexShrink: 0 }}>
                  <span style={{ fontSize: '11px', fontFamily: 'monospace', color: cfg.color, fontWeight: 600 }}>{item.sku}</span>
                </div>
                <div style={{ flex: 1, background: '#121212', borderRadius: '4px', height: '24px', overflow: 'hidden', position: 'relative' }}>
                  <div
                    style={{
                      width: `${barPct}%`,
                      height: '100%',
                      background: `linear-gradient(90deg, ${cfg.color}88, ${cfg.color}44)`,
                      borderRadius: '4px',
                      transition: 'width 0.6s ease',
                    }}
                  />
                  <span style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', color: '#e5e5e5', whiteSpace: 'nowrap' }}>
                    {item.description}
                  </span>
                </div>
                <div style={{ width: '90px', textAlign: 'right', flexShrink: 0 }}>
                  <span style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: 600, color: cfg.color }}>
                    R$ {(item.totalValue / 1000).toFixed(1)}k
                  </span>
                </div>
                <div style={{ width: '32px', textAlign: 'center', flexShrink: 0 }}>
                  <span style={{
                    fontSize: '10px', fontWeight: 700,
                    background: cfg.bg, color: cfg.color,
                    padding: '2px 6px', borderRadius: '4px',
                    border: `1px solid ${cfg.color}30`,
                  }}>
                    {item.classification}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
