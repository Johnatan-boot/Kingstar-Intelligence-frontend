import { describe, it, expect, vi } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import React from 'react';
import { AuthProvider, useAuth } from '../../context/AuthContext';

// Componente auxiliar para expor o contexto no DOM
function AuthStatus() {
  const { isAuthenticated, login, logout, register } = useAuth();
  return (
    <div>
      <span data-testid="auth-status">{isAuthenticated ? 'autenticado' : 'deslogado'}</span>
      <button onClick={() => login('a@a.com', '123')}>login</button>
      <button onClick={logout}>logout</button>
      <button onClick={() => register('a@a.com', '123', 'Nome', 'Dept', 'ADMIN')}>register</button>
    </div>
  );
}

function renderWithAuth() {
  return render(
    <AuthProvider>
      <AuthStatus />
    </AuthProvider>
  );
}

describe('AuthContext', () => {
  it('inicia como não autenticado', () => {
    renderWithAuth();
    expect(screen.getByTestId('auth-status')).toHaveTextContent('deslogado');
  });

  it('login muda isAuthenticated para true', async () => {
    renderWithAuth();
    await act(async () => {
      screen.getByText('login').click();
      await new Promise(r => setTimeout(r, 900));
    });
    expect(screen.getByTestId('auth-status')).toHaveTextContent('autenticado');
  });

  it('logout muda isAuthenticated para false', async () => {
    renderWithAuth();
    // Login primeiro
    await act(async () => {
      screen.getByText('login').click();
      await new Promise(r => setTimeout(r, 900));
    });
    expect(screen.getByTestId('auth-status')).toHaveTextContent('autenticado');

    // Logout
    act(() => screen.getByText('logout').click());
    expect(screen.getByTestId('auth-status')).toHaveTextContent('deslogado');
  });

  it('register não altera isAuthenticated (só cria conta)', async () => {
    renderWithAuth();
    await act(async () => {
      screen.getByText('register').click();
      await new Promise(r => setTimeout(r, 900));
    });
    // Cadastro não faz login automático
    expect(screen.getByTestId('auth-status')).toHaveTextContent('deslogado');
  });

  it('useAuth fora do AuthProvider lança erro', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    function ComponentFora() {
      useAuth();
      return null;
    }
    expect(() => render(<ComponentFora />)).toThrow();
    spy.mockRestore();
  });
});
