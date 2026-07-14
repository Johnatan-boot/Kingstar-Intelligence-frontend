import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Settings, Edit, Trash2, Shield, Lock, Search } from 'lucide-react';

export function AdminMfe() {
  const [users, setUsers] = useState<any[]>(() => {
    const saved = localStorage.getItem('kg_admin_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    // Dados iniciais se não houver nada no localStorage (apenas como fallback/mock inicial)
    return [
      { id: '4', name: 'Admin T.I', email: 'admin@kingstar.com', dept: 'Tecnologia', role: 'SYSTEM_ADMIN', status: 'Ativo' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('kg_admin_users', JSON.stringify(users));
  }, [users]);

  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<any>(null);

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente remover este usuário?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser.id) {
      setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
    } else {
      setUsers([...users, { ...editingUser, id: String(Date.now()), status: 'Ativo' }]);
    }
    setEditingUser(null);
  };

  const groupedUsers = users
    .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))
    .reduce((acc: Record<string, any[]>, curr) => {
      if (!acc[curr.dept]) acc[curr.dept] = [];
      acc[curr.dept].push(curr);
      return acc;
    }, {});

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header Settings */}
      <div className="shrink-0 p-6 border-b border-[#242424] bg-[#161616]">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-sky-500/10 rounded-xl border border-sky-500/20 text-sky-400">
            <Settings size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">Configurações Gerais</h1>
            <p className="text-sm text-[#8b9dc3] mt-1">Gerencie os parâmetros do sistema e acessos de usuários.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Settings Menu */}
        <div className="w-64 border-r border-[#242424] bg-[#1a1a1a] p-4 flex flex-col gap-2 shrink-0">
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#22252B] text-white text-sm font-medium border border-[#333]">
            <Users size={18} className="text-sky-400" />
            Usuários e Perfis
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#8b9dc3] hover:text-white hover:bg-[#22252B]/50 text-sm font-medium transition-colors">
            <Shield size={18} />
            Políticas de Acesso
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#8b9dc3] hover:text-white hover:bg-[#22252B]/50 text-sm font-medium transition-colors">
            <Lock size={18} />
            Segurança e JWT
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#0a0a0a]">
          {editingUser ? (
            <div className="max-w-2xl bg-[#161616] border border-[#242424] rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-6">
                {editingUser.id ? 'Editar Usuário' : 'Novo Usuário'}
              </h2>
              <form onSubmit={handleSave} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#8b9dc3] uppercase tracking-wider mb-2">Nome Completo</label>
                    <input required type="text" value={editingUser.name || ''} onChange={e => setEditingUser({...editingUser, name: e.target.value})} 
                      className="w-full bg-[#121212] border border-[#333] rounded-lg px-4 py-2.5 text-sm text-white focus:border-sky-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#8b9dc3] uppercase tracking-wider mb-2">E-mail Corporativo</label>
                    <input required type="email" value={editingUser.email || ''} onChange={e => setEditingUser({...editingUser, email: e.target.value})} 
                      className="w-full bg-[#121212] border border-[#333] rounded-lg px-4 py-2.5 text-sm text-white focus:border-sky-500 outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#8b9dc3] uppercase tracking-wider mb-2">Departamento</label>
                    <select required value={editingUser.dept || ''} onChange={e => setEditingUser({...editingUser, dept: e.target.value})} 
                      className="w-full bg-[#121212] border border-[#333] rounded-lg px-4 py-2.5 text-sm text-white focus:border-sky-500 outline-none">
                      <option value="">Selecione...</option>
                      <option value="Logística">Logística</option>
                      <option value="Financeiro">Financeiro</option>
                      <option value="Tecnologia">Tecnologia</option>
                      <option value="Compras">Compras</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#8b9dc3] uppercase tracking-wider mb-2">Perfil de Acesso (Role)</label>
                    <select required value={editingUser.role || ''} onChange={e => setEditingUser({...editingUser, role: e.target.value})} 
                      className="w-full bg-[#121212] border border-[#333] rounded-lg px-4 py-2.5 text-sm text-white focus:border-sky-500 outline-none">
                      <option value="">Selecione...</option>
                      <option value="OPERATOR">Operador Base (OPERATOR)</option>
                      <option value="GESTOR">Gestor de Área (GESTOR)</option>
                      <option value="SYSTEM_ADMIN">Administrador do Sistema (SYSTEM_ADMIN)</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button type="submit" className="px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-lg text-sm transition-colors">
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
              <div className="flex justify-between items-center mb-6">
                <div className="relative w-80">
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
                  onClick={() => setEditingUser({})}
                  className="flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg text-sm transition-colors shadow-lg"
                >
                  <UserPlus size={18} /> Adicionar Usuário
                </button>
              </div>

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
                            <th className="px-6 py-3 text-[11px] font-bold text-[#8b9dc3] uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-[11px] font-bold text-[#8b9dc3] uppercase tracking-wider">Perfil (Role)</th>
                            <th className="px-6 py-3 text-[11px] font-bold text-[#8b9dc3] uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-[11px] font-bold text-[#8b9dc3] uppercase tracking-wider text-right">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#242424]">
                          {deptUsers.map(u => (
                            <tr key={u.id} className="hover:bg-[#ffffff05] transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-[#242424] flex items-center justify-center text-xs font-bold text-sky-400">
                                    {u.name.substring(0,2).toUpperCase()}
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
                                <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {u.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => handleEdit(u)} className="p-1.5 text-[#8b9dc3] hover:text-white transition-colors"><Edit size={16} /></button>
                                  <button onClick={() => handleDelete(u.id)} className="p-1.5 text-red-500/70 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
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
                    Nenhum usuário encontrado para "{searchTerm}".
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
