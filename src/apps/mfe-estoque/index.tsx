import React, { useState, useEffect, useMemo, Fragment } from 'react';
import {
  Package, Activity, MapPin, RefreshCw,
  Search, ChevronDown, ChevronUp, Download,
  BarChart2, Bell, Layers, SlidersHorizontal,
  X, ArrowUpDown, TrendingUp, Upload
} from 'lucide-react';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

import StockDashboard   from './components/StockDashboard';
import MoveStockModal   from './components/MoveStockModal';
import CDMap            from './components/CDMap';
import ABCCurve         from './components/ABCCurve';
import StockAlerts      from './components/StockAlerts';
import BatchAdjustModal from './components/BatchAdjustModal';
import StockExportModal from './components/StockExportModal';
import { stockApi } from '../../services/api';

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
  order_number?: string;
  nf_number?: string;
}

type SortKey = 'sku_id' | 'description' | 'quantity_available' | 'total_value' | 'status' | 'order_number' | 'nf_number';
type SortDir = 'asc' | 'desc';

const STATUS_STYLES: Record<string, { label: string; cls: string }> = {
  NORMAL:  { label: 'Normal',  cls: 'badge-normal'   },
  ATENCAO: { label: 'Atenção', cls: 'badge-warning'  },
  CRITICO: { label: 'Crítico', cls: 'badge-critical' },
  RUPTURA: { label: 'Ruptura', cls: 'badge-ruptura'  },
};

const MOVEMENT_COLOR: Record<string, string> = {
  IN: '#22c55e', OUT: '#ef4444', RESERVE: '#f59e0b',
  RELEASE: '#8b5cf6', ADJUSTMENT: '#38bdf8', LOSS: '#ef4444', TRANSFER: '#06b6d4',
};

export function InventoryMfe() {
  const [tab, setTab] = useState<'overview' | 'movements' | 'map' | 'abc' | 'alerts'>('overview');
  const [showMove, setShowMove]     = useState(false);
  const [showBatch, setShowBatch]   = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [stockData, setStockData]   = useState<StockRow[]>([]);
  const [loadingStock, setLoadingStock] = useState(true);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Posição real de estoque, direto do banco (GET /estoque/saldos).
  // Antes esta tela usava buildMockData() (32 itens aleatórios gerados no
  // navegador) — nunca refletia o estoque de verdade.
  useEffect(() => {
    let cancelado = false;
    setLoadingStock(true);
    stockApi.saldos({ limit: 200 })
      .then(res => { if (!cancelado) setStockData(res.data.dados as StockRow[]); })
      .catch(() => { if (!cancelado) toast.error('Não foi possível carregar o estoque do servidor'); })
      .finally(() => { if (!cancelado) setLoadingStock(false); });
    return () => { cancelado = true; };
  }, [refreshKey]);

  const refresh = () => setRefreshKey(k => k + 1);

    const handleDownloadTemplate = () => {
    // Generate template based on current stockData (which contains the 32 mock items)
    const templateData = stockData.map(item => ({
      'SKU': item.sku_id,
      'Produto': item.description,
      'Pedido': item.order_number || '',
      'NF': item.nf_number || '',
      'Categoria': item.category,
      'Estoque Máximo': item.quantity_physical,
      'Estoque Atual': item.quantity_available,
      'Valor Unitário (R$)': item.average_cost,
      'Valor Total (R$)': item.total_value,
      'Status': item.status,
      'Localização': item.location_code || 'A01-01'
    }));

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Modelo_Estoque");
    XLSX.writeFile(wb, "modelo_importacao_estoque.xlsx");
    toast.success('Modelo Excel com os dados atuais baixado com sucesso!');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData = XLSX.utils.sheet_to_json<any>(ws);

        let processedData: any[] = [];
        if (rawData.length > 0) {
          const firstRow = rawData[0];
          const keys = Object.keys(firstRow);
          if (keys.length === 1 && typeof keys[0] === 'string' && keys[0].includes('|') && keys[0].toLowerCase().includes('sku')) {
            const headerStr = keys[0];
            const headers = headerStr.split('|').map(s => s.trim()).filter(s => s);
            
            rawData.forEach(row => {
              const valStr = row[keys[0]];
              if (typeof valStr === 'string' && valStr.includes('|')) {
                if (valStr.includes('---')) return;
                
                const values = valStr.split('|').map(s => s.trim()).filter(s => s);
                if (values.length >= headers.length || values.length > 0) {
                   const obj: any = {};
                   headers.forEach((h, i) => {
                     if (values[i] !== undefined) obj[h] = values[i];
                   });
                   processedData.push(obj);
                }
              }
            });
          } else {
             processedData = rawData;
          }
        }

        const getVal = (r: any, keys: string[]) => {
          const rowKeys = Object.keys(r);
          for (const k of keys) {
             const kNorm = k.normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
             const foundKey = rowKeys.find(rk => {
               const rkNorm = rk.replace(/\|/g, '').trim().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
               if (!rkNorm) return false;
               return rkNorm === kNorm || (kNorm.length >= 4 && rkNorm.includes(kNorm));
             });
             if (foundKey !== undefined && r[foundKey] !== undefined && r[foundKey] !== null && String(r[foundKey]).trim() !== '') {
               let val = r[foundKey];
               if (typeof val === 'string') {
                 val = val.replace(/\|/g, '').trim();
               }
               return val;
             }
          }
          return undefined;
        };

        const parseFloatSafe = (val: any) => {
          if (typeof val === 'number') return val;
          if (typeof val !== 'string') return 0;
          let s = val.replace(/\|/g, '').trim().replace(/R\$\s?/g, '');
          if (s.includes(',') && s.includes('.')) {
            if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
              s = s.replace(/\./g, '').replace(',', '.');
            } else {
              s = s.replace(/,/g, '');
            }
          } else if (s.includes(',')) {
            s = s.replace(',', '.');
          }
          const parsed = parseFloat(s);
          return isNaN(parsed) ? 0 : parsed;
        };

                                const mappedData: StockRow[] = processedData
          .filter((row: any) => {
             // Ignorar linhas de separador markdown (ex: | --- | --- |)
             const vals = Object.values(row).map(v => String(v));
             const isSeparator = vals.some(v => v.includes('---'));
             return !isSeparator;
          })
          .map((row: any) => ({
            sku_id: getVal(row, ['sku_id', 'sku']) || `SKU-${Math.floor(Math.random() * 10000)}`,
            description: getVal(row, ['description', 'descricao', 'descrição', 'produto']) || 'Produto Importado',
            category: getVal(row, ['category', 'categoria']) || 'Geral',
            quantity_physical: parseFloatSafe(getVal(row, ['quantity_physical', 'qtd fisico', 'físico', 'fisico', 'estoque maximo'])),
            quantity_reserved: parseFloatSafe(getVal(row, ['quantity_reserved', 'qtd reservado', 'reservado'])),
            quantity_available: parseFloatSafe(getVal(row, ['quantity_available', 'qtd disponivel', 'disponivel', 'estoque atual'])),
            average_cost: parseFloatSafe(getVal(row, ['average_cost', 'custo', 'custo medio', 'valor unitario', 'valor unitario (r$)'])),
            total_value: parseFloatSafe(getVal(row, ['total_value', 'valor total', 'total', 'valor total (r$)'])) || (parseFloatSafe(getVal(row, ['quantity_physical', 'qtd fisico', 'físico', 'fisico', 'estoque maximo'])) * parseFloatSafe(getVal(row, ['average_cost', 'custo', 'custo medio', 'valor unitario', 'valor unitario (r$)']))),
            status: getVal(row, ['status']) || 'NORMAL',
            location_code: getVal(row, ['location_code', 'localizacao', 'localização']) || 'A01-01',
            zone: getVal(row, ['zone', 'zona']) || 'A',
            order_number: getVal(row, ['order_number', 'pedido', 'nº pedido', 'numero pedido']) || '',
            nf_number: getVal(row, ['nf_number', 'nf', 'nota fiscal', 'nº nf', 'nota']) || '',
            last_movement_at: new Date().toISOString()
          }))
          .filter(r => !r.sku_id.includes('...') && !r.description.includes('...') && r.sku_id !== 'SKU');

        if (mappedData.length === 0) {
          toast.error('Nenhum registro reconhecido na planilha.');
          return;
        }

        // Grava de verdade no backend (POST /estoque/ajuste-lote), em vez de
        // só guardar em memória — antes, um F5 na página perdia tudo que
        // tinha sido "importado".
        const tid = toast.loading('Gravando ajuste em lote no servidor...');
        stockApi.ajusteLote(
          mappedData.map(r => ({ sku: r.sku_id, descricao: r.description, quantidade: r.quantity_physical }))
        )
          .then(() => {
            toast.dismiss(tid);
            toast.success(`${mappedData.length} SKU(s) ajustado(s) no estoque com sucesso!`);
            refresh();
          })
          .catch((err: any) => {
            toast.dismiss(tid);
            toast.error(err?.response?.data?.error ?? 'Erro ao gravar ajuste em lote no servidor');
          });
      } catch (err) {
        console.error(err);
        toast.error('Erro ao importar o arquivo Excel.');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const TABS: { id: string; label: string; icon: any; badge?: number }[] = [
    { id: 'overview',  label: 'Posição de Estoque', icon: Package },
    { id: 'movements', label: 'Movimentações',       icon: Activity },
    { id: 'abc',       label: 'Curva ABC',           icon: BarChart2 },
    { id: 'alerts',    label: 'Alertas',             icon: Bell, badge: 6 },
    { id: 'map',       label: 'Mapa do CD',          icon: MapPin },
  ];

  return (
    <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', color: '#fff' }}>
            <Package size={22} color="#22c55e" />
            Gestão de Estoque
            <span style={{ fontSize: '11px', background: 'rgba(34,197,94,0.1)', color: '#22c55e', padding: '2px 9px', borderRadius: '20px', fontWeight: 600, border: '1px solid rgba(34,197,94,0.3)' }}>
              V.D4
            </span>
          </h1>
          <p style={{ color: '#8b9dc3', fontSize: '13px', marginTop: '4px' }}>
            Event-driven · Auditável · Tempo Real · ABC Analytics · Ajuste em Lote
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button style={{ padding: '8px 16px', background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={refresh}><RefreshCw size={14} /> Atualizar / Reset</button>
          <button style={{ padding: '8px 16px', background: '#1a1a1a', border: '1px solid #333', color: '#38bdf8', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={handleDownloadTemplate}><Download size={14} /> Baixar Modelo Excel</button>
          <input type="file" accept=".xlsx, .xls" style={{ display: 'none' }} ref={fileInputRef} onChange={handleImport} />
          <button style={{ padding: '8px 16px', background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => fileInputRef.current?.click()}><Upload size={14} /> Importar Planilha</button>
          <button style={{ padding: '8px 16px', background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => setShowExport(true)}><Download size={14} /> Exportar</button>
          <button style={{ padding: '8px 16px', background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => setShowBatch(true)}><Layers size={14} /> Ajuste em Lote</button>
          <button style={{ padding: '8px 16px', background: '#22c55e', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }} onClick={() => setShowMove(true)}><Activity size={14} /> Movimentar</button>
        </div>
      </div>

      <StockDashboard key={`dash-${refreshKey}`} data={stockData} />

      <div style={{ borderBottom: '1px solid #242424', display: 'flex', gap: '2px', overflowX: 'auto' }}>
        {TABS.map(({ id, label, icon: Icon, badge }) => (
          <button key={id} onClick={() => setTab(id as any)} style={{
            padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
            borderBottom: `2px solid ${tab === id ? '#38bdf8' : 'transparent'}`,
            color: tab === id ? '#fff' : '#6b7280', display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '14px', fontWeight: 600, transition: 'all 0.2s', outline: 'none'
          }}>
            <Icon size={16} color={tab === id ? '#38bdf8' : '#6b7280'} />
            {label}
            {badge && <span style={{ background: '#ef4444', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '10px' }}>{badge}</span>}
          </button>
        ))}
      </div>

      {tab === 'overview' && <EnhancedStockTable key={`tbl-${refreshKey}`} data={stockData} />}
      {tab === 'movements' && <MovementsPanel key={`mov-${refreshKey}`} />}
      {tab === 'abc'       && <ABCCurve key={`abc-${refreshKey}`} />}
      {tab === 'alerts'    && <StockAlerts key={`alt-${refreshKey}`} />}
      {tab === 'map'       && <CDMap />}

      {showMove  && <MoveStockModal onClose={() => { setShowMove(false); refresh(); }} />}
      {showBatch && <BatchAdjustModal onClose={() => setShowBatch(false)} onDone={refresh} />}
      {showExport && <StockExportModal data={stockData} onClose={() => setShowExport(false)} />}
    </div>
  );
}

function EnhancedStockTable({ data }: { key?: string; data: StockRow[] }) {
  const [search, setSearch]         = useState('');
  const [expanded, setExpanded]     = useState<string | null>(null);
  const [movements, setMovements]   = useState<any[]>([]);
  const [sortKey, setSortKey]       = useState<SortKey>('sku_id');
  const [sortDir, setSortDir]       = useState<SortDir>('asc');
  const [filterStatus, setFilterStatus]     = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterZone, setFilterZone]         = useState('ALL');
  const [showFilters, setShowFilters]       = useState(false);

  const categories = useMemo(() => ['ALL', ...Array.from(new Set(data.map(r => r.category)))], [data]);
  const zones      = useMemo(() => ['ALL', ...Array.from(new Set(data.map(r => r.zone ?? '').filter(Boolean)))], [data]);

  const activeFilters = [
    filterStatus !== 'ALL' ? filterStatus : null,
    filterCategory !== 'ALL' ? filterCategory : null,
    filterZone !== 'ALL' ? filterZone : null,
  ].filter(Boolean) as string[];

  const clearFilters = () => { setFilterStatus('ALL'); setFilterCategory('ALL'); setFilterZone('ALL'); };

  const sorted = useMemo(() => {
    const base = data.filter(r => {
      const s = search.toLowerCase();
      const matchSearch   = !search || r.sku_id.toLowerCase().includes(s) || r.description.toLowerCase().includes(s) || r.category.toLowerCase().includes(s);
      const matchStatus   = filterStatus === 'ALL'   || r.status === filterStatus;
      const matchCategory = filterCategory === 'ALL' || r.category === filterCategory;
      const matchZone     = filterZone === 'ALL'     || r.zone === filterZone;
      return matchSearch && matchStatus && matchCategory && matchZone;
    });
    return [...base].sort((a, b) => {
      let av: any = a[sortKey]; let bv: any = b[sortKey];
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      return sortDir === 'asc' ? (av < bv ? -1 : av > bv ? 1 : 0) : (av > bv ? -1 : av < bv ? 1 : 0);
    });
  }, [data, search, filterStatus, filterCategory, filterZone, sortKey, sortDir]);

  const sort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const toggle = async (skuId: string) => {
    if (expanded === skuId) { setExpanded(null); return; }
    setExpanded(skuId);
    setMovements([]);
  };

  const totalValue = sorted.reduce((s, r) => s + r.total_value, 0);
  const totalAvail = sorted.reduce((s, r) => s + r.quantity_available, 0);

  const Th = ({ label, k }: { label: string; k?: SortKey }) => (
    <th onClick={() => k && sort(k)} style={{
      padding: '10px 14px', textAlign: 'left',
      color: k && sortKey === k ? '#22c55e' : '#8b9dc3',
      fontWeight: 600, fontSize: '11px', whiteSpace: 'nowrap',
      textTransform: 'uppercase', letterSpacing: '0.06em',
      cursor: k ? 'pointer' : 'default',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        {label}
        {k && <ArrowUpDown size={10} color={sortKey === k ? '#22c55e' : '#8b9dc3'} style={{ opacity: sortKey === k ? 1 : 0.4 }} />}
      </div>
    </th>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ background: '#1a1a1a', borderRadius: '12px', border: '1px solid #242424', padding: '12px 16px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <Search size={15} color="#8b9dc3" />
        <input
          placeholder="Buscar por SKU, descrição ou categoria..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '180px', border: 'none', background: 'transparent', fontSize: '14px', color: '#fff', outline: 'none' }}
        />
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {activeFilters.map(f => (
            <span key={f} style={{ fontSize: '11px', background: 'rgba(34,197,94,0.1)', color: '#22c55e', padding: '3px 10px', borderRadius: '20px', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              {f} <X size={10} style={{ cursor: 'pointer' }} onClick={() => { if (f === filterStatus) setFilterStatus('ALL'); if (f === filterCategory) setFilterCategory('ALL'); if (f === filterZone) setFilterZone('ALL'); }} />
            </span>
          ))}
          <button style={{ padding: '4px 10px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }} onClick={() => setShowFilters(v => !v)}>
            <SlidersHorizontal size={13} /> Filtros {activeFilters.length > 0 && <span style={{ background: '#22c55e', color: '#fff', borderRadius: '50%', width: '16px', height: '16px', fontSize: '9px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyItems: 'center', paddingLeft: 4 }}>{activeFilters.length}</span>}
          </button>
          <span style={{ fontSize: '12px', color: '#8b9dc3', whiteSpace: 'nowrap' }}>{sorted.length}/{data.length} itens</span>
        </div>
      </div>

      {showFilters && (
        <div style={{ background: '#1a1a1a', borderRadius: '12px', border: '1px solid #242424', padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
          {[
            { label: 'Status',    value: filterStatus,   set: setFilterStatus,   opts: ['ALL','NORMAL','ATENCAO','CRITICO','RUPTURA'] },
            { label: 'Categoria', value: filterCategory, set: setFilterCategory, opts: categories },
            { label: 'Zona',      value: filterZone,     set: setFilterZone,     opts: zones },
          ].map(({ label, value, set, opts }) => (
            <div key={label}>
              <p style={{ fontSize: '11px', color: '#8b9dc3', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>{label}</p>
              <select value={value} onChange={e => set(e.target.value)} style={{ width: '100%', background: '#121212', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '13px', padding: '7px 10px', cursor: 'pointer', outline: 'none' }}>
                {opts.map((o: string) => <option key={o} value={o}>{o === 'ALL' ? `Todos (${label})` : o}</option>)}
              </select>
            </div>
          ))}
          {activeFilters.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '12px', width: '100%', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', cursor: 'pointer' }} onClick={clearFilters}><X size={12} /> Limpar filtros</button>
            </div>
          )}
        </div>
      )}

      {sorted.length > 0 && (
        <div style={{ display: 'flex', gap: '20px', padding: '0 4px' }}>
          <span style={{ fontSize: '12px', color: '#8b9dc3' }}>Disponível: <strong style={{ color: '#22c55e', fontFamily: 'monospace' }}>{totalAvail.toLocaleString()} un.</strong></span>
          <span style={{ fontSize: '12px', color: '#8b9dc3' }}>Valor: <strong style={{ color: '#facc15', fontFamily: 'monospace' }}>R$ {(totalValue / 1000).toFixed(1)}k</strong></span>
        </div>
      )}

      <div style={{ background: '#1a1a1a', borderRadius: '12px', border: '1px solid #242424', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #242424', background: '#161616' }}>
                <th style={{ padding: '10px 10px 10px 14px', width: '28px' }}></th>
                <Th label="SKU"               k="sku_id" />
                <Th label="Pedido"            k="order_number" />
                <Th label="NF"                k="nf_number" />
                <Th label="Descrição"         k="description" />
                <Th label="Zona" />
                <Th label="Disponível"        k="quantity_available" />
                <Th label="Físico / Reserv." />
                <Th label="Localização" />
                <Th label="Custo Médio" />
                <Th label="Valor Total"       k="total_value" />
                <Th label="Status"            k="status" />
                <Th label="Última Mov." />
              </tr>
            </thead>
            <tbody style={{ color: '#fff' }}>
              {sorted.map(row => {
                const badgeInfo = STATUS_STYLES[row.status] || STATUS_STYLES['NORMAL'];
                return (
                <React.Fragment key={row.sku_id}>
                  <tr onClick={() => toggle(row.sku_id)}
                    style={{ borderBottom: '1px solid #242424', cursor: 'pointer', transition: 'background 0.1s', background: expanded === row.sku_id ? '#242424' : 'transparent' }}
                  >
                    <td style={{ padding: '10px 10px 10px 14px', color: '#8b9dc3' }}>
                      {expanded === row.sku_id ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                    </td>
                    <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: '#22c55e', fontWeight: 600 }}>{row.sku_id}</td>
                    <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: '12px' }}>{row.order_number ?? '—'}</td>
                    <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: '12px' }}>{row.nf_number ?? '—'}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontWeight: 500 }}>{row.description}</div>
                      <div style={{ fontSize: '11px', color: '#8b9dc3', marginTop: '2px' }}>{row.category}</div>
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: '11px', color: '#8b9dc3' }}>{row.zone ?? '—'}</td>
                    <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontWeight: 700, color: row.quantity_available <= 0 ? '#ef4444' : row.quantity_available < 20 ? '#facc15' : '#22c55e' }}>
                      {row.quantity_available.toLocaleString()}
                    </td>
                    <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: '12px' }}>
                      <span style={{ color: '#e5e5e5' }}>{row.quantity_physical.toLocaleString()}</span>
                      <span style={{ color: '#8b9dc3', margin: '0 4px' }}>/</span>
                      <span style={{ color: '#facc15' }}>{row.quantity_reserved.toLocaleString()}</span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#8b9dc3', fontSize: '12px' }}>
                        <MapPin size={11}/>{row.location_code}
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: '#8b9dc3', fontSize: '12px' }}>R$ {row.average_cost.toFixed(2)}</td>
                    <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontWeight: 600 }}>R$ {(row.total_value / 1000).toFixed(1)}k</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{
                        padding: '4px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, 
                        border: '1px solid ' + (badgeInfo.cls === 'badge-critical' ? '#ef4444' : badgeInfo.cls === 'badge-ruptura' ? '#ef4444' : badgeInfo.cls === 'badge-warning' ? '#facc15' : '#22c55e'),
                        color: badgeInfo.cls === 'badge-critical' ? '#ef4444' : badgeInfo.cls === 'badge-ruptura' ? '#ef4444' : badgeInfo.cls === 'badge-warning' ? '#facc15' : '#22c55e',
                      }}>{badgeInfo.label ?? row.status}</span>
                    </td>
                    <td style={{ padding: '10px 14px', color: '#8b9dc3', fontSize: '12px', whiteSpace: 'nowrap' }}>
                      {row.last_movement_at ? new Date(row.last_movement_at).toLocaleDateString('pt-BR') : '—'}
                    </td>
                  </tr>
                  {expanded === row.sku_id && (
                    <tr key={`${row.sku_id}-exp`}>
                      <td colSpan={13} style={{ background: '#121212', borderBottom: '1px solid #242424' }}>
                        <div style={{ padding: '16px 24px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', gap: '20px', flexShrink: 0 }}>
                            {[
                              { label: 'Físico',     value: row.quantity_physical.toLocaleString(),   color: '#fff' },
                              { label: 'Reservado',  value: row.quantity_reserved.toLocaleString(),   color: '#facc15' },
                              { label: 'Disponível', value: row.quantity_available.toLocaleString(),  color: '#22c55e' },
                              { label: 'Ocupação',   value: `${Math.round((row.quantity_reserved / Math.max(row.quantity_physical, 1)) * 100)}%`, color: '#38bdf8' },
                            ].map(kpi => (
                              <div key={kpi.label}>
                                <p style={{ fontSize: '10px', color: '#8b9dc3', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{kpi.label}</p>
                                <p style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'monospace', color: kpi.color, marginTop: '2px' }}>{kpi.value}</p>
                              </div>
                            ))}
                          </div>
                          <div style={{ flex: 1, minWidth: '260px' }}>
                            <p style={{ fontSize: '11px', color: '#8b9dc3', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Últimas Movimentações</p>
                            {movements.length === 0 ? (
                              <p style={{ color: '#8b9dc3', fontSize: '12px' }}>Nenhuma movimentação registrada.</p>
                            ) : null}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
                );
              })}
              {sorted.length === 0 && (
                <tr><td colSpan={11} style={{ padding: '60px', textAlign: 'center', color: '#8b9dc3' }}>
                  <TrendingUp size={28} style={{ opacity: 0.3, display: 'block', margin: '0 auto 12px' }} />
                  Nenhum item para os filtros aplicados
                  <button onClick={clearFilters} style={{ display: 'block', margin: '10px auto 0', fontSize: '13px', color: '#22c55e', background: 'none', border: 'none', cursor: 'pointer' }}>Limpar filtros</button>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MovementsPanel() {
  const [data, setData]           = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  useEffect(() => {
    setLoading(true);
    stockApi.movimentacoes({ limit: 100 })
      .then(res => setData(res.data.dados))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  const types = ['ALL', ...Array.from(new Set(data.map(m => m.movement_type)))];
  const filtered = data.filter(m => {
    const matchType = typeFilter === 'ALL' || m.movement_type === typeFilter;
    const s = filter.toLowerCase();
    const matchSearch = !filter || m.sku_id?.toLowerCase().includes(s) || m.movement_type?.toLowerCase().includes(s) || m.reference_type?.toLowerCase().includes(s);
    return matchType && matchSearch;
  });

  return (
    <div style={{ background: '#1a1a1a', borderRadius: '12px', border: '1px solid #242424' }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #242424', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <Search size={14} color="#8b9dc3" />
        <input placeholder="Filtrar por SKU, tipo ou referência..." value={filter} onChange={e => setFilter(e.target.value)}
          style={{ flex: 1, minWidth: '160px', border: 'none', background: 'transparent', color: '#fff', fontSize: '13px', outline: 'none' }}
        />
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          style={{ background: '#121212', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '12px', padding: '5px 10px', cursor: 'pointer', outline: 'none' }}>
          {types.map((t: any) => <option key={t} value={t}>{t === 'ALL' ? 'Todos os tipos' : t}</option>)}
        </select>
        <span style={{ fontSize: '12px', color: '#8b9dc3' }}>{filtered.length} registros</span>
      </div>
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#8b9dc3' }}>Carregando...</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #242424', background: '#161616' }}>
                {['Tipo','SKU','Qtd','Motivo/Referência','Data/Hora'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#8b9dc3', fontWeight: 600, fontSize: '11px', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, i) => (
                <tr key={m.id ?? i} style={{ borderBottom: '1px solid #242424', transition: 'background 0.1s' }}>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ background: `${MOVEMENT_COLOR[m.movement_type] ?? '#8b9dc3'}22`, color: MOVEMENT_COLOR[m.movement_type] ?? '#8b9dc3', fontSize: '11px', padding: '4px 8px', borderRadius: '6px', fontWeight: 600 }}>{m.movement_type}</span>
                  </td>
                  <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: '#22c55e', fontWeight: 600 }}>{m.sku_id}</td>
                  <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontWeight: 600 }}>
                    <span style={{ color: m.quantity > 0 ? '#22c55e' : '#ef4444' }}>{m.quantity > 0 ? '+' : ''}{m.quantity}</span>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#8b9dc3', fontSize: '12px' }}>{m.reference_type ?? '—'}</td>
                  <td style={{ padding: '10px 14px', color: '#8b9dc3', fontSize: '12px', whiteSpace: 'nowrap' }}>{m.occurred_at ? new Date(m.occurred_at).toLocaleString('pt-BR') : '—'}</td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#8b9dc3' }}>Nenhuma movimentação encontrada</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
