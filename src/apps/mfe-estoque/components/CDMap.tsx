import { useState } from 'react';
import { Sliders, Info } from 'lucide-react';

const ZONES = [
  { id: 'A', label: 'Zona A',       area: 2200, used: 1870, color: '#00d4ff', items: 42 },
  { id: 'B', label: 'Zona B',       area: 1800, used: 1100, color: '#8b5cf6', items: 31 },
  { id: 'C', label: 'Zona C',       area: 1600, used:  480, color: '#10b981', items: 18 },
  { id: 'D', label: 'Zona D',       area: 1400, used: 1390, color: '#ef4444', items: 28 },
  { id: 'R', label: 'Recebimento',  area:  900, used:  620, color: '#f59e0b', items: 15 },
  { id: 'E', label: 'Expedição',    area:  800, used:  200, color: '#06b6d4', items:  8 },
  { id: 'AV', label: 'Avarias',     area:  300, used:  180, color: '#f97316', items:  5 },
  { id: 'OF', label: 'Overflow',    area: 2141, used:    0, color: '#4a5568', items:  0 },
];
const TOTAL_AREA = 11141;

export default function CDMap() {
  const [selected, setSelected] = useState<string|null>(null);
  const [viewMode, setViewMode] = useState<'grid'|'density'>('grid');
  const totalUsed = ZONES.reduce((s, z) => s + z.used, 0);
  const occupancy = Math.round((totalUsed / TOTAL_AREA) * 100);
  const sel = ZONES.find(z => z.id === selected);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ background: '#1a1a1a', border: '1px solid #242424', borderRadius: '12px', padding: '20px 24px', color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '15px' }}>Centro de Distribuição — 11.141 m²</h3>
            <p style={{ color: '#8b9dc3', fontSize: '12px', marginTop: '3px' }}>Ocupação global: {occupancy}%</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['grid','density'] as const).map(m => (
              <button key={m} onClick={() => setViewMode(m)} style={{ padding: '6px 14px', fontSize: '12px', background: viewMode === m ? '#22c55e' : 'transparent', color: viewMode === m ? '#fff' : '#8b9dc3', border: viewMode === m ? 'none' : '1px solid #333', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                {m === 'grid' ? 'Grid' : 'Densidade'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative', height: '10px', background: '#121212', borderRadius: '5px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${occupancy}%`,
            background: occupancy > 85 ? '#ef4444' : occupancy > 70 ? '#facc15' : '#22c55e',
            borderRadius: '5px',
            transition: 'width 0.8s ease',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', color: '#8b9dc3' }}>
          <span>0 m²</span>
          <span style={{ color: occupancy > 85 ? '#ef4444' : '#e5e5e5', fontWeight: 600 }}>
            {totalUsed.toLocaleString()} m² ocupados
          </span>
          <span>11.141 m²</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
        {ZONES.map(zone => {
          const pct = Math.round((zone.used / zone.area) * 100);
          const isSelected = selected === zone.id;
          return (
            <div
              key={zone.id}
              onClick={() => setSelected(isSelected ? null : zone.id)}
              style={{
                background: '#1a1a1a',
                border: `1px solid ${isSelected ? zone.color : '#242424'}`,
                borderRadius: '12px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: isSelected ? `0 0 16px ${zone.color}30` : 'none',
              }}
              onMouseEnter={e => { if(!isSelected) e.currentTarget.style.borderColor = zone.color+'80'; }}
              onMouseLeave={e => { if(!isSelected) e.currentTarget.style.borderColor = '#242424'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: zone.color }}>{zone.label}</div>
                  <div style={{ fontSize: '11px', color: '#8b9dc3', marginTop: '2px' }}>{zone.area.toLocaleString()} m²</div>
                </div>
                <span style={{
                  fontSize: '13px', fontWeight: 700, fontFamily: 'monospace',
                  color: pct > 90 ? '#ef4444' : pct > 75 ? '#facc15' : zone.color
                }}>{pct}%</span>
              </div>

              {viewMode === 'grid' ? (
                <div style={{ position: 'relative', height: '6px', background: '#121212', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: pct > 90 ? '#ef4444' : zone.color, borderRadius: '3px', transition: 'width 0.6s ease' }} />
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10,1fr)', gap: '2px', height: '40px' }}>
                  {Array.from({ length: 50 }).map((_, i) => (
                    <div key={i} style={{ borderRadius: '2px', background: i < Math.round(pct/2) ? zone.color : '#333', opacity: i < Math.round(pct/2) ? 0.8 : 0.3 }} />
                  ))}
                </div>
              )}

              <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#8b9dc3' }}>
                <span>{zone.items} SKUs</span>
                <span>{zone.used.toLocaleString()} m² usados</span>
              </div>
            </div>
          );
        })}
      </div>

      {sel && (
        <div style={{ background: '#1a1a1a', border: `1px solid ${sel.color}`, borderRadius: '12px', padding: '20px 24px', color: '#fff' }}>
          <h4 style={{ fontWeight: 700, color: sel.color, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Info size={16}/> {sel.label} — Detalhes
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {[
              { label: 'Área Total',    value: `${sel.area.toLocaleString()} m²` },
              { label: 'Área Utilizada',value: `${sel.used.toLocaleString()} m²` },
              { label: 'Disponível',    value: `${(sel.area - sel.used).toLocaleString()} m²` },
              { label: 'SKUs',          value: sel.items.toString() },
            ].map(s => (
              <div key={s.label} style={{ background: '#121212', padding: '12px', borderRadius: '8px' }}>
                <p style={{ fontSize: '11px', color: '#8b9dc3', marginBottom: '4px' }}>{s.label}</p>
                <p style={{ fontWeight: 700, fontFamily: 'monospace', color: sel.color }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
