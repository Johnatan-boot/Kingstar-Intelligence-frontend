import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Settings, Edit, Trash2, Shield, Lock, Search, Loader2, Eye, EyeOff } from 'lucide-react';
import { usuariosApi } from '../../services/api';
import toast from 'react-hot-toast';

const FUNCOES = [
  { value: 'SUPER_ADMIN', label: 'Super Administrador' },
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'GESTOR', label: 'Gestor de Área' },
  { value: 'COMPRAS', label: 'Compras' },
  { value: 'PCL', label: 'PCL (Divergências)' },
  { value: 'ANALITICA', label: 'Analítica' },
  { value: 'RECEBIMENTO', label: 'Recebimento' },
  { value: 'CONFERENCIA', label: 'Conferência' },
  { value: 'ESTOQUE', label: 'Estoque' },
];

const DEPARTAMENTOS = ['Logística', 'Financeiro', 'Tecnologia', 'Compras', 'Recebimento', 'Conferência', 'Estoque', 'Diretoria', 'PCL'];

type MenuAba = 'usuarios' | 'acessos' | 'seguranca';

export function AdminMfe() {
  const [aba, setAba] = useState<MenuAba>('usuarios');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const carregarUsuarios = async (search?: string) => {
    setLoading(true);
    try {
      const res = await usuariosApi.list(search ? { search } : undefined);
      setUsers(res.data.dados);
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Erro ao carregar usuários. Verifique seu perfil de acesso.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarUsuarios(); }, []);

  // Busca com debounce simples — evita disparar uma requisição a cada tecla
  useEffect(() => {
    const t = setTimeout(() => carregarUsuarios(searchTerm || undefined), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const handleDelete = async (user: any) => {
    if (!confirm(`Deseja realmente desativar o usuário "${user.name}"?`)) return;
    try {
      await usuariosApi.remove(user.id);
      toast.success('Usuário desativado com sucesso');
      carregarUsuarios(searchTerm || undefined);
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Erro ao desativar usuário');
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser({ ...user });
    setPassword('');
  };

  const handleNew = () => {
    setEditingUser({ role: 'RECEBIMENTO', dept: DEPARTAMENTOS[0] });
    setPassword('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingUser.id) {
        await usuariosApi.update(editingUser.id, {
          name: editingUser.name,
          email: editingUser.email,
          role: editingUser.role,
          dept: editingUser.dept,
          ...(password ? { password } : {}),
        });
        toast.success('Usuário atualizado com sucesso');
      } else {
        if (!password || password.length < 6) {
          toast.error('Defina uma senha com ao menos 6 caracteres');
          setSaving(false);
          return;
        }
        await usuariosApi.create({
          name: editingUser.name,
          email: editingUser.email,
          password,
          role: editingUser.role,
          dept: editingUser.dept,
        });
        toast.success('Usuário criado com sucesso');
      }
      setEditingUser(null);
      carregarUsuarios(searchTerm || undefined);
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Erro ao salvar usuário');
    } finally {
      setSaving(false);
    }
  };

  const groupedUsers = users
    .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))
    .reduce((acc: Record<string, any[]>, curr) => {
      const chave = curr.dept || 'Sem departamento';
      if (!acc[chave]) acc[chave] = [];
      acc[chave].push(curr);
      return acc;
    }, {});

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Cabeçalho */}
      <div className="shrink-0 p-4 sm:p-6 border-b border-[#242424] bg-[#161616]">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-sky-500/10 rounded-xl border border-sky-500/20 text-sky-400 shrink-0">
            <Settings size={24} />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-wide">Configurações Gerais</h1>
            <p className="text-xs sm:text-sm text-[#8b9dc3] mt-1">Gerencie os parâmetros do sistema e acessos de usuários.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Menu lateral de Configurações — vira um menu horizontal em telas pequenas */}
        <div className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-[#242424] bg-[#1a1a1a] p-3 lg:p-4 flex flex-row lg:flex-col gap-2 shrink-0 overflow-x-auto">
          <button
            onClick={() => setAba('usuarios')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              aba === 'usuarios' ? 'bg-[#22252B] text-white border border-[#333]' : 'text-[#8b9dc3] hover:text-white hover:bg-[#22252B]/50'
            }`}
          >
            <Users size={18} className={aba === 'usuarios' ? 'text-sky-400' : ''} />
            Usuários e Perfis
          </button>
          <button
            onClick={() => setAba('acessos')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              aba === 'acessos' ? 'bg-[#22252B] text-white border border-[#333]' : 'text-[#8b9dc3] hover:text-white hover:bg-[#22252B]/50'
            }`}
          >
            <Shield size={18} className={aba === 'acessos' ? 'text-sky-400' : ''} />
            Políticas de Acesso
          </button>
          <button
            onClick={() => setAba('seguranca')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              aba === 'seguranca' ? 'bg-[#22252B] text-white border border-[#333]' : 'text-[#8b9dc3] hover:text-white hover:bg-[#22252B]/50'
            }`}
          >
            <Lock size={18} className={aba === 'seguranca' ? 'text-sky-400' : ''} />
            Segurança e JWT
          </button>
        </div>

        {/* Área de conteúdo */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0a0a0a]">
          {aba === 'acessos' && (
            <div className="max-w-2xl bg-[#161616] border border-[#242424] rounded-2xl p-6 text-sm text-[#8b9dc3] leading-relaxed">
              <h2 className="text-lg font-bold text-white mb-4">Políticas de Acesso (RBAC)</h2>
              <p className="mb-3"><strong className="text-white">Acesso total</strong> (SUPER_ADMIN, ADMIN, GESTOR, COMPRAS, PCL, ANALITICA): enxerga dados sigilosos, telas de Analytics, Ayda Core e financeiro.</p>
              <p><strong className="text-white">Operacional</strong> (RECEBIMENTO, CONFERENCIA, ESTOQUE): acesso apenas às telas operacionais do dia a dia — recebimento, conferência, estoque e agenda.</p>
            </div>
          )}

          {aba === 'seguranca' && (
            <div className="max-w-2xl bg-[#161616] border border-[#242424] rounded-2xl p-6 text-sm text-[#8b9dc3] leading-relaxed">
              <h2 className="text-lg font-bold text-white mb-4">Segurança e Autenticação</h2>
              <p className="mb-3">A autenticação usa tokens <strong className="text-white">JWT</strong>, válidos por 8 horas por padrão, emitidos no login.</p>
              <p>Senhas são armazenadas com hash <strong className="text-white">bcrypt</strong> — nunca em texto puro.</p>
            </div>
          )}

          {aba === 'usuarios' && (
            editingUser ? (
              <div className="max-w-2xl bg-[#161616] border border-[#242424] rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-6">
                  {editingUser.id ? 'Editar Usuário' : 'Novo Usuário'}
                </h2>
                <form onSubmit={handleSave} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#8b9dc3] uppercase tracking-wider mb-2">Nome Completo</label>
                      <input required type="text" value={editingUser.name || ''} onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                        className="w-full bg-[#121212] border border-[#333] rounded-lg px-4 py-2.5 text-sm text-white focus:border-sky-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#8b9dc3] uppercase tracking-wider mb-2">E-mail Corporativo</label>
                      <input required type="email" value={editingUser.email || ''} onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                        className="w-full bg-[#121212] border border-[#333] rounded-lg px-4 py-2.5 text-sm text-white focus:border-sky-500 outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#8b9dc3] uppercase tracking-wider mb-2">Departamento</label>
                      <select required value={editingUser.dept || ''} onChange={e => setEditingUser({ ...editingUser, dept: e.target.value })}
                        className="w-full bg-[#121212] border border-[#333] rounded-lg px-4 py-2.5 text-sm text-white focus:border-sky-500 outline-none">
                        <option value="">Selecione...</option>
                        {DEPARTAMENTOS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#8b9dc3] uppercase tracking-wider mb-2">Perfil de Acesso</label>
                      <select required value={editingUser.role || ''} onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                        className="w-full bg-[#121212] border border-[#333] rounded-lg px-4 py-2.5 text-sm text-white focus:border-sky-500 outline-none">
                        <option value="">Selecione...</option>
                        {FUNCOES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#8b9dc3] uppercase tracking-wider mb-2">
                      {editingUser.id ? 'Nova Senha (deixe em branco para manter a atual)' : 'Senha'}
                    </label>
                    <div className="relative">
                      <input
                        required={!editingUser.id}
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        minLength={6}
                        placeholder="Mínimo 6 caracteres"
                        className="w-full bg-[#121212] border border-[#333] rounded-lg px-4 py-2.5 pr-10 text-sm text-white focus:border-sky-500 outline-none"
                      />
                      <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b9dc3] hover:text-white">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2">
                    <button type="submit" disabled={saving} className="px-6 py-2.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-60 text-white font-bold rounded-lg text-sm transition-colors flex items-center gap-2">
                      {saving && <Loader2 size={14} className="animate-spin" />}
                      Salvar Usuário
                    </button>
                    <button type="button" onClick={() => setEditingUser(null)} className="px-6 py-2.5 bg-[#242424] hover:bg-[#333] text-white font-bold rounded-lg text-sm transition-colors">
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6">
                  <div className="relative w-full sm:w-80">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b9dc3]" />
                    <input
                      type="text"
                      placeholder="Buscar usuários..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full bg-[#161616] border border-[#242424] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:border-sky-500 outline-none transition-colors"
                    />
                  </div>
                  <button
                    onClick={handleNew}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg text-sm transition-colors shadow-lg shrink-0"
                  >
                    <UserPlus size={18} /> Adicionar Usuário
                  </button>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center gap-3 text-[#8b9dc3] p-10">
                    <Loader2 size={20} className="animate-spin" /> Carregando usuários...
                  </div>
                ) : (
                  <div className="flex flex-col gap-8">
                    {Object.entries(groupedUsers as Record<string, any[]>).map(([dept, deptUsers]) => (
                      <div key={dept} className="bg-[#161616] border border-[#242424] rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-[#242424] bg-[#1a1a1a]">
                          <h3 className="font-bold text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-sky-500"></span> {dept}
                            <span className="ml-2 px-2 py-0.5 rounded-full bg-[#242424] text-[#8b9dc3] text-xs">{deptUsers.length}</span>
                          </h3>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="bg-[#121212] border-b border-[#242424]">
                                <th className="px-6 py-3 text-[11px] font-bold text-[#8b9dc3] uppercase tracking-wider">Nome</th>
                                <th className="px-6 py-3 text-[11px] font-bold text-[#8b9dc3] uppercase tracking-wider">E-mail</th>
                                <th className="px-6 py-3 text-[11px] font-bold text-[#8b9dc3] uppercase tracking-wider">Perfil</th>
                                <th className="px-6 py-3 text-[11px] font-bold text-[#8b9dc3] uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-[11px] font-bold text-[#8b9dc3] uppercase tracking-wider text-right">Ações</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#242424]">
                              {deptUsers.map(u => (
                                <tr key={u.id} className="hover:bg-[#ffffff05] transition-colors">
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-[#242424] flex items-center justify-center text-xs font-bold text-sky-400 shrink-0">
                                        {u.name.substring(0, 2).toUpperCase()}
                                      </div>
                                      <span className="text-sm font-medium text-white">{u.name}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-sm text-[#8b9dc3]">{u.email}</td>
                                  <td className="px-6 py-4">
                                    <span className="px-2.5 py-1 rounded-md bg-[#242424] border border-[#333] text-[#8b9dc3] text-[10px] font-bold tracking-wider">
                                      {u.role}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className={`flex items-center gap-1.5 text-xs font-medium ${u.status === 'Ativo' ? 'text-emerald-400' : 'text-red-400'}`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Ativo' ? 'bg-emerald-500' : 'bg-red-500'}`}></span> {u.status}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <button onClick={() => handleEdit(u)} className="p-1.5 text-[#8b9dc3] hover:text-white transition-colors"><Edit size={16} /></button>
                                      <button onClick={() => handleDelete(u)} className="p-1.5 text-red-500/70 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}

                    {Object.keys(groupedUsers).length === 0 && (
                      <div className="text-center p-10 text-[#8b9dc3]">
                        Nenhum usuário encontrado{searchTerm ? ` para "${searchTerm}"` : ''}.
                      </div>
                    )}
                  </div>
                )}
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
}
