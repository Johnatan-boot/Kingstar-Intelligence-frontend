import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, AlertTriangle, Package, Truck, CheckCircle, Clock, Activity, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { analyticsApi } from '../../services/api';

function Card({ children, style = {} }: any) {
  return <div style={{ background: '#1a1a1a', border: '1px solid #242424', borderRadius: 12, ...style }}>{children}</div>;
}

const PIE_COLORS = ['#22c55e', '#38bdf8', '#8b5cf6', '#f59e0b', '#ef4444'];

export function AnalyticsMfe() {
  const [data, setData]     = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = () => {
      analyticsApi.dashboard()
        .then(res => { setData(res.data.data); setLoading(false); })
        .catch(() => setLoading(false));
    };
    fetch();
    const interval = setInterval(fetch, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div style={{ padding: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: '#8b9dc3', gap: 10 }}>
      <Loader2 size={22} style={{ animation: 'spin 1s linear infinite' }} /> Carregando analytics...
    </div>
  );

  if (!data) return <div style={{ padding: 28, color: '#8b9dc3' }}>Sem dados disponíveis</div>;

  const { metrics, score, history, supplierScores, kpis } = data;

  const pieData = [
    { name: 'Concluído', value: Number(kpis?.completed_pos ?? 0) },
    { name: 'Conferência', value: Number(kpis?.conference_pos ?? 0) },
    { name: 'Recebendo', value: Number(kpis?.receiving_pos ?? 0) },
    { name: 'Pendente', value: Number(kpis?.pending_pos ?? 0) },
    { name: 'Cancelado', value: Number(kpis?.cancelled_pos ?? 0) },
  ].filter(d => d.value > 0);

  const scoreColor = score?.classification === 'Excelente' ? '#22c55e' : score?.classification === 'Boa' ? '#38bdf8' : score?.classification === 'Regular' ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(139,92,246,.12)', border: '1px solid rgba(139,92,246,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BarChart3 size={18} color="#8b5cf6" />
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>Analytics & Performance</h1>
          <p style={{ fontSize: 12, color: '#8b9dc3', marginTop: 2 }}>Métricas operacionais e inteligência de dados</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12 }}>
        {[
          { label: 'NFs Concluídas', value: metrics?.totalCompletedNFs ?? 0, icon: CheckCircle, color: '#22c55e' },
          { label: 'Veículos Recebidos', value: metrics?.totalVehiclesReceived ?? 0, icon: Truck, color: '#38bdf8' },
          { label: 'Peças Conferidas', value: metrics?.totalPiecesChecked ?? 0, icon: Package, color: '#8b5cf6' },
          { label: 'Taxa de Erro', value: `${metrics?.errorRate ?? 0}%`, icon: AlertTriangle, color: '#ef4444' },
          { label: 'Avarias', value: metrics?.totalDamages ?? 0, icon: AlertTriangle, color: '#f59e0b' },
          { label: 'Divergências', value: metrics?.totalDivergences ?? 0, icon: Activity, color: '#f97316' },
          { label: 'Tempo Rec. Médio', value: metrics?.avgReceivingMin ? `${metrics.avgReceivingMin} min` : '—', icon: Clock, color: '#06b6d4' },
          { label: 'Tempo Conf. Médio', value: metrics?.avgConferenceMin ? `${metrics.avgConferenceMin} min` : '—', icon: Clock, color: '#a78bfa' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: 11, color: '#8b9dc3', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>{label}</span>
                <div style={{ background: `${color}18`, padding: 6, borderRadius: 7 }}><Icon size={14} color={color} /></div>
              </div>
              <p style={{ fontSize: 26, fontWeight: 800, fontFamily: 'monospace', color }}>{value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Score + Pie */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Card>
          <div style={{ padding: '20px' }}>
            <p style={{ fontSize: 12, color: '#8b9dc3', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Score Operacional</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
              <span style={{ fontSize: 52, fontWeight: 900, fontFamily: 'monospace', color: scoreColor }}>{score?.total ?? '—'}</span>
              <span style={{ fontSize: 20, fontWeight: 600, color: scoreColor }}>{score?.classification}</span>
            </div>
            <div style={{ width: '100%', height: 8, background: '#121212', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{ width: `${score?.total ?? 0}%`, height: '100%', background: `linear-gradient(90deg, ${scoreColor}80, ${scoreColor})`, borderRadius: 4, transition: 'width 1s ease' }} />
            </div>
            <p style={{ fontSize: 11, color: '#8b9dc3' }}>Baseado em: taxa de erro, avarias, volume e tempo de ciclo</p>
          </div>
        </Card>

        <Card>
          <div style={{ padding: '20px' }}>
            <p style={{ fontSize: 12, color: '#8b9dc3', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Status dos Pedidos</p>
            {pieData.length > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <ResponsiveContainer width={120} height={120}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={55} dataKey="value" strokeWidth={0}>
                      {pieData.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {pieData.map((d, idx) => (
                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: PIE_COLORS[idx % PIE_COLORS.length], flexShrink: 0 }} />
                      <span style={{ color: '#e5e5e5' }}>{d.name}</span>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#fff', marginLeft: 'auto' }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p style={{ color: '#8b9dc3', fontSize: 14, textAlign: 'center', paddingTop: 30 }}>Sem dados suficientes</p>
            )}
          </div>
        </Card>
      </div>

      {/* History chart */}
      {history && history.length > 0 && (
        <Card>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #242424' }}>
            <h3 style={{ fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <TrendingUp size={16} color="#38bdf8" /> Volume de Pedidos — Últimos 14 dias
            </h3>
          </div>
          <div style={{ padding: '20px' }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[...history].reverse()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#242424" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#8b9dc3' }}
                  tickFormatter={v => new Date(v).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} />
                <YAxis tick={{ fontSize: 10, fill: '#8b9dc3' }} />
                <Tooltip contentStyle={{ background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: 8, fontSize: 12 }}
                  labelFormatter={v => new Date(v).toLocaleDateString('pt-BR')} />
                <Bar dataKey="completed" name="Concluídas" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="total" name="Total" fill="#38bdf8" radius={[4, 4, 0, 0]} opacity={0.4} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Supplier ranking */}
      {supplierScores && supplierScores.length > 0 && (
        <Card>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #242424' }}>
            <h3 style={{ fontWeight: 600, fontSize: 14, color: '#fff' }}>Ranking de Fornecedores</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #242424', background: '#121212' }}>
                  {['#', 'Fornecedor', 'Score', 'Entregas', 'Divergências', 'Tempo Médio'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, color: '#8b9dc3', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {supplierScores.map((s: any, i: number) => {
                  const sc = s.score;
                  const scColor = sc >= 90 ? '#22c55e' : sc >= 70 ? '#f59e0b' : '#ef4444';
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid #242424' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#161616')}
                      onMouseLeave={e => (e.currentTarget.style.background = '')}>
                      <td style={{ padding: '10px 16px', color: '#8b9dc3', fontFamily: 'monospace' }}>#{i + 1}</td>
                      <td style={{ padding: '10px 16px', color: '#e5e5e5', fontWeight: 500 }}>{s.supplier}</td>
                      <td style={{ padding: '10px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, color: scColor, fontSize: 14 }}>{sc}</span>
                          <div style={{ flex: 1, height: 4, background: '#121212', borderRadius: 2, overflow: 'hidden', minWidth: 60 }}>
                            <div style={{ width: `${sc}%`, height: '100%', background: scColor, borderRadius: 2 }} />
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '10px 16px', color: '#8b9dc3' }}>{s.totalDeliveries}</td>
                      <td style={{ padding: '10px 16px', color: s.divergences > 0 ? '#ef4444' : '#22c55e' }}>{s.divergences}</td>
                      <td style={{ padding: '10px 16px', color: '#8b9dc3' }}>{s.avgDeliveryTime > 0 ? `${s.avgDeliveryTime.toFixed(1)} min` : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
