import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act, getAllByRole } from '@testing-library/react';
import React from 'react';
import toast from 'react-hot-toast';
import AuthPage from '../../apps/shell/AuthPage';

const mockLogin    = vi.fn();
const mockRegister = vi.fn();

vi.mock('../../context/AuthContext', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../context/AuthContext')>();
  return {
    ...original,
    useAuth: () => ({
      isAuthenticated: false,
      login:    mockLogin,
      register: mockRegister,
      logout:   vi.fn(),
    }),
  };
});

// A AuthPage tem 2 botões "Entrar": o toggle (topo) e o submit (fundo)
// Usa getAllByRole e pega o último (submit)
const getSubmitBtn = () => {
  const btns = screen.getAllByRole('button', { name: /entrar/i });
  return btns[btns.length - 1];
};

describe('AuthPage — modo Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin.mockResolvedValue(undefined);
  });

  it('renderiza campos de e-mail e senha', () => {
    render(<AuthPage />);
    expect(screen.getByPlaceholderText('nome@empresa.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('renderiza botão Entrar (submit)', () => {
    render(<AuthPage />);
    expect(getSubmitBtn()).toBeInTheDocument();
  });

  it('mostra toast de erro se e-mail e senha vazios', async () => {
    render(<AuthPage />);
    await act(async () => fireEvent.click(getSubmitBtn()));
    expect(vi.mocked(toast).error).toHaveBeenCalledWith('Preencha e-mail e senha');
  });

  it('mostra toast de erro se apenas senha vazia', async () => {
    render(<AuthPage />);
    fireEvent.change(screen.getByPlaceholderText('nome@empresa.com'), { target: { value: 'x@x.com' } });
    await act(async () => fireEvent.click(getSubmitBtn()));
    expect(vi.mocked(toast).error).toHaveBeenCalledWith('Preencha e-mail e senha');
  });

  it('chama login com e-mail e senha corretos', async () => {
    render(<AuthPage />);
    fireEvent.change(screen.getByPlaceholderText('nome@empresa.com'), { target: { value: 'diego@k.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'senha123' } });
    await act(async () => fireEvent.click(getSubmitBtn()));
    expect(mockLogin).toHaveBeenCalledWith('diego@k.com', 'senha123');
  });

  it('login faz trim do e-mail', async () => {
    render(<AuthPage />);
    fireEvent.change(screen.getByPlaceholderText('nome@empresa.com'), { target: { value: '  diego@k.com  ' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'pass' } });
    await act(async () => fireEvent.click(getSubmitBtn()));
    expect(mockLogin).toHaveBeenCalledWith('diego@k.com', 'pass');
  });

  it('mostra toast de erro quando login falha', async () => {
    mockLogin.mockRejectedValue({ message: 'Credenciais inválidas' });
    render(<AuthPage />);
    fireEvent.change(screen.getByPlaceholderText('nome@empresa.com'), { target: { value: 'x@x.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'errada' } });
    await act(async () => fireEvent.click(getSubmitBtn()));
    expect(vi.mocked(toast).error).toHaveBeenCalledWith('Credenciais inválidas');
  });

  it('exibe credenciais de teste', () => {
    render(<AuthPage />);
    expect(screen.getByText(/admin@kingstar\.com/i)).toBeInTheDocument();
  });
});

describe('AuthPage — modo Cadastro', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRegister.mockResolvedValue(undefined);
  });

  // O toggle "Cadastrar" é único — não tem conflito
  const getCadastrarToggle = () => screen.getAllByRole('button', { name: /cadastrar/i })[0];

  it('alterna para modo Cadastro', async () => {
    render(<AuthPage />);
    await act(async () => fireEvent.click(getCadastrarToggle()));
    expect(screen.getByPlaceholderText('João Silva')).toBeInTheDocument();
  });

  it('mostra campo nome no modo cadastro', async () => {
    render(<AuthPage />);
    fireEvent.click(getCadastrarToggle());
    expect(screen.getByPlaceholderText('João Silva')).toBeInTheDocument();
  });

  it('mostra selects de departamento e perfil', async () => {
    render(<AuthPage />);
    fireEvent.click(getCadastrarToggle());
    expect(screen.getByText('Departamento')).toBeInTheDocument();
    expect(screen.getByText('Perfil de acesso')).toBeInTheDocument();
  });

  it('bloqueia submit sem nome preenchido', async () => {
    render(<AuthPage />);
    fireEvent.click(getCadastrarToggle());
    fireEvent.change(screen.getByPlaceholderText('nome@empresa.com'), { target: { value: 'x@x.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: '123456' } });
    await act(async () => fireEvent.click(screen.getByRole('button', { name: /criar conta/i })));
    expect(vi.mocked(toast).error).toHaveBeenCalledWith('Preencha o nome completo');
  });

  it('chama register com todos os dados', async () => {
    render(<AuthPage />);
    fireEvent.click(getCadastrarToggle());
    fireEvent.change(screen.getByPlaceholderText('João Silva'), { target: { value: 'Diego Santos' } });
    fireEvent.change(screen.getByPlaceholderText('nome@empresa.com'), { target: { value: 'diego@k.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'senha123' } });
    await act(async () => fireEvent.click(screen.getByRole('button', { name: /criar conta/i })));
    expect(mockRegister).toHaveBeenCalledWith('diego@k.com', 'senha123', 'Diego Santos', expect.any(String), expect.any(String));
  });

  it('cadastro bem-sucedido → volta para Login e mostra toast', async () => {
    render(<AuthPage />);
    fireEvent.click(getCadastrarToggle());
    fireEvent.change(screen.getByPlaceholderText('João Silva'), { target: { value: 'João' } });
    fireEvent.change(screen.getByPlaceholderText('nome@empresa.com'), { target: { value: 'j@j.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: '123456' } });
    await act(async () => fireEvent.click(screen.getByRole('button', { name: /criar conta/i })));
    expect(vi.mocked(toast).success).toHaveBeenCalledWith('Conta criada com sucesso! Faça login.');
  });
});
