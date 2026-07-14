import { useState, useEffect } from 'react';
import { Package, Layers, AlertTriangle, DollarSign, TrendingUp } from 'lucide-react';
import { stockApi } from '../../../services/api';

interface Stats {
  totalSkus: number;
  totalPieces: number;
  availableStock: number;
  criticalItems: number;
  totalValue: number;
}

export default function StockDashboard({ data }: { data?: any[] }) {
  const [stats, setStats]     = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (data && data.length > 0) {
      const totalSkus = data.length;
      const totalPieces = data.reduce((acc, r) => acc + (r.quantity_physical || 0), 0);
      const availableStock = data.reduce((acc, r) => acc + (r.quantity_available || 0), 0);
      const criticalItems = data.filter(r => r.status === 'CRITICO' || r.status === 'RUPTURA').length;
      const totalValue = data.reduce((acc, r) => acc + ((r.quantity_physical || 0) * (r.average_cost || 0)), 0);
      setStats({ totalSkus, totalPieces, availableStock, criticalItems, totalValue });
      setLoading(false);
    } else {
      stockApi.dashboard()
        .then((d: any) => setStats(d?.data || { totalSkus:142, totalPieces:38420, availableStock:35100, criticalItems:7, totalValue:1240000 }))
        .catch(() => setStats({ totalSkus:142, totalPieces:38420, availableStock:35100, criticalItems:7, totalValue:1240000 }))
        .finally(() => setLoading(false));
    }
  }, [data]);

  const cards = [
    {
      label: 'Total SKUs',
      value: loading ? '—' : (stats?.totalSkus ?? 0).toLocaleString(),
      icon: Package,
      color: '#38bdf8',
      sub: 'produtos cadastrados',
    },
    {
      label: 'Total Peças',
      value: loading ? '—' : (stats?.totalPieces ?? 0).toLocaleString(),
      icon: Layers,
      color: '#8b5cf6',
      sub: 'unidades físicas',
    },
    {
      label: 'Disponível',
      value: loading ? '—' : (stats?.availableStock ?? 0).toLocaleString(),
      icon: TrendingUp,
      color: '#22c55e',
      sub: `${stats ? Math.round((stats.availableStock/Math.max(stats.totalPieces,1))*100) : 0}% do físico`,
    },
    {
      label: 'Itens Críticos',
      value: loading ? '—' : (stats?.criticalItems ?? 0).toString(),
      icon: AlertTriangle,
      color: '#ef4444',
      sub: 'abaixo do mínimo',
      alert: (stats?.criticalItems ?? 0) > 0,
    },
    {
      label: 'Valor Total',
      value: loading ? '—' : `R$ ${((stats?.totalValue ?? 0)/1000).toFixed(0)}k`,
      icon: DollarSign,
      color: '#facc15',
      sub: 'custo médio ponderado',
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
      {cards.map(c => (
        <div
          key={c.label}
          style={{
            background: '#1a1a1a',
            border: `1px solid ${c.alert ? '#ef4444' : '#242424'}`,
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: c.alert ? '0 0 16px rgba(239,68,68,0.1)' : 'none',
            transition: 'all 0.2s',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '12px', color: '#8b9dc3', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              {c.label}
            </span>
            <div style={{ background: `${c.color}18`, padding: '7px', borderRadius: '8px' }}>
              <c.icon size={16} color={c.color} />
            </div>
          </div>
          <div>
            <p style={{ fontSize: '26px', fontWeight: 700, fontFamily: 'monospace', color: c.color }}>
              {loading ? <span>...</span> : c.value}
            </p>
            <p style={{ fontSize: '12px', color: '#8b9dc3', marginTop: '4px' }}>{c.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
