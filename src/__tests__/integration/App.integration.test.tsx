import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

afterEach(() => cleanup());

// ── Mock pesado — ShellLayout requer todos os MFEs carregados
vi.mock('../../apps/shell/ShellLayout', () => ({
  ShellLayout: () => <div data-testid="shell-layout">Shell Ativo</div>,
}));
vi.mock('../../backend/bootstrap', () => ({ bootstrapBackend: vi.fn() }));

describe('[Integração] App — roteamento por autenticação', () => {
  it('exibe AuthPage (formulário de login) quando não autenticado', async () => {
    const { default: App } = await import('../../App');
    render(<App />);
    expect(screen.getByPlaceholderText('nome@empresa.com')).toBeInTheDocument();
    expect(screen.queryByTestId('shell-layout')).not.toBeInTheDocument();
  });

  it('exibe ShellLayout após login bem-sucedido', async () => {
    const { default: App } = await import('../../App');
    render(<App />);

    await userEvent.type(screen.getByPlaceholderText('nome@empresa.com'), 'admin@k.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'Admin@123!');
    // Clica no botão de submit (último "Entrar")
    await userEvent.click(screen.getAllByText('Entrar').at(-1)!);

    await waitFor(() => {
      expect(screen.getByTestId('shell-layout')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('AuthProvider está presente — useAuth não lança fora do provider', async () => {
    const { default: App } = await import('../../App');
    expect(() => render(<App />)).not.toThrow();
  });
});

describe('[Integração] AuthPage + AuthContext — fluxo real', () => {
  it('exibe campos corretos de login', async () => {
    const { default: RealAuthPage } = await import('../../apps/shell/AuthPage');
    const { AuthProvider } = await import('../../context/AuthContext');
    render(<AuthProvider><RealAuthPage /></AuthProvider>);

    expect(screen.getByPlaceholderText('nome@empresa.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('login real muda isAuthenticated para true', async () => {
    const { default: RealAuthPage } = await import('../../apps/shell/AuthPage');
    const { AuthProvider, useAuth } = await import('../../context/AuthContext');

    function Probe() {
      const { isAuthenticated } = useAuth();
      return <span data-testid="probe">{String(isAuthenticated)}</span>;
    }
    render(<AuthProvider><RealAuthPage /><Probe /></AuthProvider>);
    expect(screen.getByTestId('probe').textContent).toBe('false');

    await userEvent.type(screen.getByPlaceholderText('nome@empresa.com'), 'admin@k.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'Admin@123!');
    await userEvent.click(screen.getAllByText('Entrar').at(-1)!);

    await waitFor(() =>
      expect(screen.getByTestId('probe').textContent).toBe('true'),
    { timeout: 3000 });
  });
});
