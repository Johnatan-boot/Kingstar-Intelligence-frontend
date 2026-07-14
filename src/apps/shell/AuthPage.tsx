import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

type Role = 'ADMIN' | 'STOCK' | 'PURCHASING' | 'CONFERENCE' | 'RECEIVING';

export default function AuthPage() {
  const { login, register } = useAuth();

  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [name,       setName]       = useState('');
  const [department, setDepartment] = useState('Recebimento');
  const [role,       setRole]       = useState<Role>('RECEIVING');
  const [isRegister, setIsRegister] = useState(false);
  const [loading,    setLoading]    = useState(false);

  async function handleSubmit() {
    if (!email.trim() || !password.trim()) {
      toast.error('Preencha e-mail e senha');
      return;
    }
    if (isRegister && !name.trim()) {
      toast.error('Preencha o nome completo');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await register(email.trim(), password, name.trim(), department, role);
        toast.success('Conta criada com sucesso! Faça login.');
        setIsRegister(false);
        setPassword('');
      } else {
        await login(email.trim(), password);
        // Não é necessário navigate, o App.tsx vai renderizar o ShellLayout assim que isAuthenticated mudar
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        err?.message ??
        'Erro na autenticação';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSubmit();
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-kingstar-bg w-full">
      <Toaster
        position="top-center"
        toastOptions={{
          style: { background: '#1e1e1e', color: '#e5e5e5', border: '1px solid #2a2a2a' },
        }}
      />

      <div className="w-full max-w-md p-8 rounded-xl bg-kingstar-panel border border-kingstar-border shadow-2xl shadow-black/50 flex flex-col items-center gap-5">

        {/* Logo */}
        <div className="flex flex-col items-center gap-2 mb-2">
          <div className="w-16 h-16 rounded-xl bg-kingstar-cyan/10 border border-kingstar-cyan/30 flex items-center justify-center">
            <img className="w-18 h-16" src="data:image/png;base64,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" alt="" />
          </div>
          <h1 className="text-xl font-semibold text-white">KingStar Intelligence</h1>
          <p className="text-zinc-400 text-sm"> Sistema de Inteligência Operacional</p>
        </div>

        {/* Toggle Login / Cadastro */}
        <div className="flex w-full bg-zinc-800 rounded-lg p-1 gap-1">
          {(['Entrar', 'Cadastrar'] as const).map((label, i) => (
            <button
              key={label}
              onClick={() => setIsRegister(i === 1)}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
                (isRegister ? i === 1 : i === 0)
                  ? 'bg-kingstar-cyan text-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Nome — só no cadastro */}
        {isRegister && (
          <div className="w-full text-left">
            <label className="text-zinc-400 text-sm">Nome completo</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full mt-1 p-2.5 rounded-md bg-zinc-800 border border-zinc-700 text-white outline-none focus:ring-2 focus:ring-kingstar-cyan text-sm"
              placeholder="João Silva"
            />
          </div>
        )}

        {/* E-mail */}
        <div className="w-full text-left">
          <label className="text-zinc-400 text-sm">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full mt-1 p-2.5 rounded-md bg-zinc-800 border border-zinc-700 text-white outline-none focus:ring-2 focus:ring-kingstar-cyan text-sm"
            placeholder="nome@empresa.com"
          />
        </div>

        {/* Senha */}
        <div className="w-full text-left">
          <label className="text-zinc-400 text-sm">Senha</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full mt-1 p-2.5 rounded-md bg-zinc-800 border border-zinc-700 text-white outline-none focus:ring-2 focus:ring-kingstar-cyan text-sm"
            placeholder="••••••••"
          />
        </div>

        {/* Departamento + Perfil — só no cadastro */}
        {isRegister && (
          <>
            <div className="w-full text-left">
              <label className="text-zinc-400 text-sm">Departamento</label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full mt-1 p-2.5 rounded-md bg-zinc-800 border border-zinc-700 text-white outline-none focus:ring-2 focus:ring-kingstar-cyan text-sm"
              >
                <option>Compras</option>
                <option>Recebimento</option>
                <option>Conferência</option>
                <option>Estoque</option>
                <option>Diretoria</option>
                <option>PCL</option>
              </select>
            </div>
            <div className="w-full text-left">
              <label className="text-zinc-400 text-sm">Perfil de acesso</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as Role)}
                className="w-full mt-1 p-2.5 rounded-md bg-zinc-800 border border-zinc-700 text-white outline-none focus:ring-2 focus:ring-kingstar-cyan text-sm"
              >
                <option value="RECEIVING">Operador (Recebimento)</option>
                <option value="CONFERENCE">Conferente</option>
                <option value="STOCK">Estoque</option>
                <option value="PURCHASING">Compras</option>
                <option value="ADMIN">Gestor / Admin</option>
              </select>
            </div>
          </>
        )}

        {/* Botão */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-kingstar-cyan hover:bg-sky-400 disabled:opacity-60 text-black font-semibold py-2.5 rounded-md transition text-sm mt-2"
        >
          {loading ? 'Aguarde...' : isRegister ? 'Criar conta' : 'Entrar'}
        </button>

        {/* Credenciais de teste */}
        {!isRegister && (
          <p className="text-zinc-500 text-xs text-center mt-2">
            Teste: admin@kingstar.com / Admin@123!
          </p>
        )}
      </div>
    </div>
  );
}
