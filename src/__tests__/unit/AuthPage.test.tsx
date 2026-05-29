import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import toast from 'react-hot-toast';
import AuthPage from '../../apps/shell/AuthPage';
import { AuthProvider } from '../../context/AuthContext';

const mockLogin    = vi.fn().mockResolvedValue(undefined);
const mockRegister = vi.fn().mockResolvedValue(undefined);

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

function renderAuthPage() {
  return render(<AuthPage />);
}

describe('AuthPage — Renderização inicial', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    renderAuthPage();
  });

  it('exibe o título KingStar WMS', () => {
    expect(screen.getByText('KingStar WMS')).toBeInTheDocument();
  });

  it('exibe campos de e-mail e senha', () => {
    expect(screen.getByPlaceholderText('nome@empresa.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('exibe botão "Entrar" no modo login', () => {
    expect(screen.getAllByText('Entrar').length).toBeGreaterThanOrEqual(1);
  });

  it('exibe dica de credenciais de teste', () => {
    expect(screen.getByText(/admin@kingstar.com/)).toBeInTheDocument();
  });

  it('NÃO exibe campo de nome no modo login', () => {
    expect(screen.queryByPlaceholderText('João Silva')).not.toBeInTheDocument();
  });
});

describe('AuthPage — Alternância Login / Cadastro', () => {
  beforeEach(() => { vi.clearAllMocks(); renderAuthPage(); });

  it('alterna para modo cadastro ao clicar em Cadastrar', async () => {
    await userEvent.click(screen.getByText('Cadastrar'));
    expect(screen.getByPlaceholderText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('Criar conta')).toBeInTheDocument();
  });

  it('exibe selects de departamento e perfil no cadastro', async () => {
    await userEvent.click(screen.getByText('Cadastrar'));
    expect(screen.getByText('Departamento')).toBeInTheDocument();
    expect(screen.getByText('Perfil de acesso')).toBeInTheDocument();
  });

  it('volta para modo login ao clicar em Entrar', async () => {
    await userEvent.click(screen.getByText('Cadastrar'));
    await userEvent.click(screen.getAllByText('Entrar').at(-1)!);
    expect(screen.queryByPlaceholderText('João Silva')).not.toBeInTheDocument();
  });
});

describe('AuthPage — Validação de formulário', () => {
  beforeEach(() => { vi.clearAllMocks(); renderAuthPage(); });

  it('mostra erro se e-mail estiver vazio', async () => {
    await userEvent.click(screen.getAllByText('Entrar').at(-1)!);
    expect(toast.error).toHaveBeenCalledWith('Preencha e-mail e senha');
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('mostra erro se senha estiver vazia', async () => {
    await userEvent.type(screen.getByPlaceholderText('nome@empresa.com'), 'a@b.com');
    await userEvent.click(screen.getAllByText('Entrar').at(-1)!);
    expect(toast.error).toHaveBeenCalledWith('Preencha e-mail e senha');
  });

  it('no cadastro, mostra erro se nome estiver vazio', async () => {
    await userEvent.click(screen.getByText('Cadastrar'));
    await userEvent.type(screen.getByPlaceholderText('nome@empresa.com'), 'a@b.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), '123456');
    await userEvent.click(screen.getByText('Criar conta'));
    expect(toast.error).toHaveBeenCalledWith('Preencha o nome completo');
  });
});

describe('AuthPage — Submissão Login', () => {
  beforeEach(() => vi.clearAllMocks());

  it('chama login com e-mail e senha corretos', async () => {
    renderAuthPage();
    await userEvent.type(screen.getByPlaceholderText('nome@empresa.com'), 'diego@k.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'senha123');
    await userEvent.click(screen.getAllByText('Entrar').at(-1)!);
    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith('diego@k.com', 'senha123'));
  });

  it('submete com Enter no campo de senha', async () => {
    renderAuthPage();
    await userEvent.type(screen.getByPlaceholderText('nome@empresa.com'), 'x@y.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'pass{Enter}');
    await waitFor(() => expect(mockLogin).toHaveBeenCalled());
  });

  it('desabilita botão durante loading', async () => {
    let resolveLogin!: () => void;
    mockLogin.mockReturnValue(new Promise<void>(res => { resolveLogin = res; }));
    renderAuthPage();

    await userEvent.type(screen.getByPlaceholderText('nome@empresa.com'), 'x@y.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'pass');
    await userEvent.click(screen.getAllByText('Entrar').at(-1)!);

    expect(screen.getByText('Aguarde...')).toBeDisabled();
    await act(async () => resolveLogin());
  });
});

describe('AuthPage — Submissão Cadastro', () => {
  beforeEach(() => vi.clearAllMocks());

  it('chama register com dados corretos', async () => {
    renderAuthPage();
    await userEvent.click(screen.getByText('Cadastrar'));
    await userEvent.type(screen.getByPlaceholderText('João Silva'), 'Diego Costa');
    await userEvent.type(screen.getByPlaceholderText('nome@empresa.com'), 'diego@k.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'senha123');
    await userEvent.click(screen.getByText('Criar conta'));
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        'diego@k.com', 'senha123', 'Diego Costa', expect.any(String), expect.any(String)
      );
    });
  });

  it('volta para login após cadastro bem-sucedido', async () => {
    renderAuthPage();
    await userEvent.click(screen.getByText('Cadastrar'));
    await userEvent.type(screen.getByPlaceholderText('João Silva'), 'Test User');
    await userEvent.type(screen.getByPlaceholderText('nome@empresa.com'), 'test@k.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'pass123');
    await userEvent.click(screen.getByText('Criar conta'));
    await waitFor(() => expect(toast.success).toHaveBeenCalled());
    await waitFor(() => expect(screen.getAllByText('Entrar').length).toBeGreaterThanOrEqual(1));
  });
});

describe('AuthPage — Tratamento de erros da API', () => {
  beforeEach(() => vi.clearAllMocks());

  it('exibe mensagem de erro da API quando login falha', async () => {
    mockLogin.mockRejectedValue({
      response: { data: { error: 'E-mail ou senha incorretos' } },
    });
    renderAuthPage();
    await userEvent.type(screen.getByPlaceholderText('nome@empresa.com'), 'x@y.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'wrong');
    await userEvent.click(screen.getAllByText('Entrar').at(-1)!);
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('E-mail ou senha incorretos')
    );
  });

  it('exibe mensagem genérica se API não retornar erro estruturado', async () => {
    mockLogin.mockRejectedValue(new Error('Network error'));
    renderAuthPage();
    await userEvent.type(screen.getByPlaceholderText('nome@empresa.com'), 'x@y.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'pass');
    await userEvent.click(screen.getAllByText('Entrar').at(-1)!);
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Network error')
    );
  });
});
