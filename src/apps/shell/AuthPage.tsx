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
          <div className="w-32 h-32 border-radius:12px; rounded-xl bg-kingstar-cyan/10 border border-kingstar-cyan/30 flex items-center justify-center">
              <img className="w-32 h-32 border-radaius:12px;" src="../../assets/logo_kingstar.png" alt="KingStar" />

          </div>
          <h1 className="text-xl font-semibold text-white">KingStar WMS</h1>
          <p className="text-zinc-400 text-sm">Inteligência Operacional Logística</p>
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
