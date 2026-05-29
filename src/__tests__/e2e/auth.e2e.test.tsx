import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import React from 'react';
import toast from 'react-hot-toast';
import AuthPage from '../../apps/shell/AuthPage';

const mockLogin    = vi.fn().mockResolvedValue(undefined);
const mockRegister = vi.fn().mockResolvedValue(undefined);

vi.mock('../../context/AuthContext', async (importOriginal) => {
  const original = await importOriginal<any>();
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

// AuthPage tem 2 botões "Entrar" — pega o último (submit)
const getSubmitBtn  = () => { const b = screen.getAllByRole('button', { name: /entrar/i }); return b[b.length - 1]; };
const getCadastrarToggle = () => screen.getAllByRole('button', { name: /cadastrar/i })[0];

describe('[E2E] Fluxo de Login', () => {
  beforeEach(() => vi.clearAllMocks());

  it('formulário completo submete sem erro de validação', async () => {
    render(<AuthPage />);
    fireEvent.change(screen.getByPlaceholderText('nome@empresa.com'), { target: { value: 'admin@kingstar.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'Admin@123!' } });
    await act(async () => { fireEvent.click(getSubmitBtn()); await new Promise(r => setTimeout(r, 50)); });
    expect(vi.mocked(toast).error).not.toHaveBeenCalled();
  });

  it('botão fica desabilitado (Aguarde...) durante loading', async () => {
    mockLogin.mockImplementation(() => new Promise(r => setTimeout(r, 200)));
    render(<AuthPage />);
    fireEvent.change(screen.getByPlaceholderText('nome@empresa.com'), { target: { value: 'x@x.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: '123' } });
    act(() => { fireEvent.click(getSubmitBtn()); });
    await waitFor(() => expect(screen.getByText('Aguarde...')).toBeDisabled());
  });

  it('Enter no campo senha dispara submit', async () => {
    render(<AuthPage />);
    fireEvent.change(screen.getByPlaceholderText('nome@empresa.com'), { target: { value: 'x@x.com' } });
    const senha = screen.getByPlaceholderText('••••••••');
    fireEvent.change(senha, { target: { value: '123456' } });
    await act(async () => { fireEvent.keyDown(senha, { key: 'Enter' }); await new Promise(r => setTimeout(r, 50)); });
    expect(vi.mocked(toast).error).not.toHaveBeenCalled();
  });
});

describe('[E2E] Validações de formulário', () => {
  beforeEach(() => vi.clearAllMocks());

  it('bloqueia com campos vazios', async () => {
    render(<AuthPage />);
    await act(async () => fireEvent.click(getSubmitBtn()));
    expect(vi.mocked(toast).error).toHaveBeenCalledWith('Preencha e-mail e senha');
  });

  it('bloqueia com apenas e-mail', async () => {
    render(<AuthPage />);
    fireEvent.change(screen.getByPlaceholderText('nome@empresa.com'), { target: { value: 'x@x.com' } });
    await act(async () => fireEvent.click(getSubmitBtn()));
    expect(vi.mocked(toast).error).toHaveBeenCalledWith('Preencha e-mail e senha');
  });

  it('bloqueia com apenas senha', async () => {
    render(<AuthPage />);
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: '123456' } });
    await act(async () => fireEvent.click(getSubmitBtn()));
    expect(vi.mocked(toast).error).toHaveBeenCalledWith('Preencha e-mail e senha');
  });
});

describe('[E2E] Fluxo de Cadastro', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fluxo completo: alterncar → preencher → criar → volta para login', async () => {
    render(<AuthPage />);
    fireEvent.click(getCadastrarToggle());
    fireEvent.change(screen.getByPlaceholderText('João Silva'), { target: { value: 'Diego Santos' } });
    fireEvent.change(screen.getByPlaceholderText('nome@empresa.com'), { target: { value: 'diego@k.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'Senha@123' } });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /criar conta/i })); await new Promise(r => setTimeout(r, 50)); });
    expect(vi.mocked(toast).success).toHaveBeenCalledWith('Conta criada com sucesso! Faça login.');
  });

  it('bloqueia cadastro sem nome', async () => {
    render(<AuthPage />);
    fireEvent.click(getCadastrarToggle());
    fireEvent.change(screen.getByPlaceholderText('nome@empresa.com'), { target: { value: 'x@x.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: '123456' } });
    await act(async () => fireEvent.click(screen.getByRole('button', { name: /criar conta/i })));
    expect(vi.mocked(toast).error).toHaveBeenCalledWith('Preencha o nome completo');
  });

  it('campos de cadastro visíveis apenas no modo correto', () => {
    render(<AuthPage />);
    expect(screen.queryByPlaceholderText('João Silva')).not.toBeInTheDocument();
    fireEvent.click(getCadastrarToggle());
    expect(screen.getByPlaceholderText('João Silva')).toBeInTheDocument();
    fireEvent.click(getSubmitBtn()); // o toggle Entrar
    expect(screen.queryByPlaceholderText('João Silva')).not.toBeInTheDocument();
  });
});

describe('[E2E] Toggle Login ↔ Cadastro', () => {
  it('alterna múltiplas vezes corretamente', () => {
    render(<AuthPage />);
    for (let i = 0; i < 3; i++) {
      fireEvent.click(getCadastrarToggle());
      expect(screen.getByPlaceholderText('João Silva')).toBeInTheDocument();
      fireEvent.click(getSubmitBtn()); // toggle Entrar no topo
      expect(screen.queryByPlaceholderText('João Silva')).not.toBeInTheDocument();
    }
  });
});
