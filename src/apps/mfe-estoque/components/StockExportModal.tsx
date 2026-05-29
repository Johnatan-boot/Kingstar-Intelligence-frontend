import { useState } from 'react';
import { Download, FileText, Table2, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface StockRow {
  sku_id: string;
  description: string;
  category: string;
  quantity_physical: number;
  quantity_reserved: number;
  quantity_available: number;
  average_cost: number;
  total_value: number;
  status: string;
  location_code?: string;
  zone?: string;
  last_movement_at?: string;
}

interface Props {
  data: StockRow[];
  onClose: () => void;
}

export default function StockExportModal({ data, onClose }: Props) {
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set([
    'sku_id', 'description', 'category', 'quantity_physical',
    'quantity_available', 'average_cost', 'total_value', 'status', 'location_code',
  ]));

  const FIELDS: { key: keyof StockRow; label: string }[] = [
    { key: 'sku_id', label: 'SKU' },
    { key: 'description', label: 'Descrição' },
    { key: 'category', label: 'Categoria' },
    { key: 'quantity_physical', label: 'Qtd. Física' },
    { key: 'quantity_reserved', label: 'Qtd. Reservada' },
    { key: 'quantity_available', label: 'Qtd. Disponível' },
    { key: 'average_cost', label: 'Custo Médio (R$)' },
    { key: 'total_value', label: 'Valor Total (R$)' },
    { key: 'status', label: 'Status' },
    { key: 'location_code', label: 'Localização' },
    { key: 'zone', label: 'Zona' },
    { key: 'last_movement_at', label: 'Última Movimentação' },
  ];

  const toggle = (key: string) => {
    const next = new Set(selectedFields);
    next.has(key) ? next.delete(key) : next.add(key);
    setSelectedFields(next);
  };

  const doExport = () => {
    const fields = FIELDS.filter(f => selectedFields.has(f.key));
    const now = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');

    if (format === 'csv') {
      const header = fields.map(f => f.label).join(',');
      const rows = data.map(row =>
        fields.map(f => {
          const val = row[f.key];
          if (f.key === 'last_movement_at' && val) return new Date(val as string).toLocaleString('pt-BR');
          if (typeof val === 'number') return val.toFixed(2);
          return `"${val ?? ''}"`;
        }).join(',')
      );
      const csv = [header, ...rows].join('\n');
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `estoque_${now}.csv`;
      a.click();
    } else {
      const json = data.map(row => Object.fromEntries(fields.map(f => [f.key, row[f.key]])));
      const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `estoque_${now}.json`;
      a.click();
    }

    toast.success(`${data.length} itens exportados como ${format.toUpperCase()}`);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
      zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        background: '#1a1a1a',
        border: '1px solid #242424',
        borderRadius: '16px',
        width: '100%', maxWidth: '480px',
        boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
        color: '#fff'
      }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #242424', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Exportar Estoque</h2>
            <p style={{ fontSize: '12px', color: '#8b9dc3', marginTop: '2px' }}>{data.length} itens selecionados</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b9dc3' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Format */}
          <div>
            <p style={{ fontSize: '12px', color: '#8b9dc3', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Formato</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {([
                { id: 'csv', icon: Table2, label: 'CSV', desc: 'Excel / Sheets' },
                { id: 'json', icon: FileText, label: 'JSON', desc: 'API / Dev' },
              ] as const).map(f => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  style={{
                    background: format === f.id ? 'rgba(34,197,94,0.1)' : '#121212',
                    border: `1px solid ${format === f.id ? '#22c55e' : '#333'}`,
                    borderRadius: '8px',
                    padding: '12px',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '10px',
                    transition: 'all 0.15s',
                  }}
                >
                  <f.icon size={16} color={format === f.id ? '#22c55e' : '#8b9dc3'} />
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: format === f.id ? '#22c55e' : '#fff' }}>{f.label}</p>
                    <p style={{ fontSize: '11px', color: '#8b9dc3' }}>{f.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Fields */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <p style={{ fontSize: '12px', color: '#8b9dc3', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Campos ({selectedFields.size}/{FIELDS.length})
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setSelectedFields(new Set(FIELDS.map(f => f.key)))} style={{ fontSize: '11px', color: '#22c55e', background: 'none', border: 'none', cursor: 'pointer' }}>Todos</button>
                <button onClick={() => setSelectedFields(new Set())} style={{ fontSize: '11px', color: '#8b9dc3', background: 'none', border: 'none', cursor: 'pointer' }}>Nenhum</button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {FIELDS.map(f => {
                const active = selectedFields.has(f.key);
                return (
                  <button
                    key={f.key}
                    onClick={() => toggle(f.key)}
                    style={{
                      background: active ? 'rgba(34,197,94,0.1)' : 'transparent',
                      border: `1px solid ${active ? 'rgba(34,197,94,0.3)' : '#333'}`,
                      borderRadius: '8px',
                      padding: '7px 10px',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '7px',
                      fontSize: '12px',
                      color: active ? '#22c55e' : '#8b9dc3',
                      transition: 'all 0.15s',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ width: '14px', height: '14px', borderRadius: '3px', border: `1px solid ${active ? '#22c55e' : '#333'}`, background: active ? '#22c55e' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {active && <Check size={9} color="#000" />}
                    </div>
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ padding: '14px 22px', borderTop: '1px solid #242424', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', background: 'transparent', color: '#fff', border: '1px solid #333', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
          <button onClick={doExport} disabled={selectedFields.size === 0} style={{ padding: '8px 16px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
            <Download size={14} /> Exportar {data.length} itens
          </button>
        </div>
      </div>
    </div>
  );
}
