import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, act, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { AuthProvider, useAuth } from '../../context/AuthContext';

afterEach(() => cleanup());

function TestUI({ onLogin, onLogout }: { onLogin?: () => void; onLogout?: () => void }) {
  const { isAuthenticated, login, logout, register } = useAuth();
  return (
    <div>
      <span data-testid="auth">{String(isAuthenticated)}</span>
      {onLogin  && <button onClick={() => { login(); onLogin(); }}>login</button>}
      {onLogout && <button onClick={() => { logout(); onLogout(); }}>logout</button>}
    </div>
  );
}

describe('AuthContext', () => {
  it('inicia como não autenticado', () => {
    render(<AuthProvider><TestUI /></AuthProvider>);
    expect(screen.getByTestId('auth').textContent).toBe('false');
  });

  it('login muda isAuthenticated para true', async () => {
    const cb = vi.fn();
    render(<AuthProvider><TestUI onLogin={cb} /></AuthProvider>);
    await userEvent.click(screen.getByText('login'));
    await waitFor(() => expect(screen.getByTestId('auth').textContent).toBe('true'));
  });

  it('logout muda isAuthenticated para false', async () => {
    function LoginLogout() {
      const { isAuthenticated, login, logout } = useAuth();
      return (
        <div>
          <span data-testid="s">{String(isAuthenticated)}</span>
          <button onClick={() => login()}>login</button>
          <button onClick={logout}>logout</button>
        </div>
      );
    }
    render(<AuthProvider><LoginLogout /></AuthProvider>);
    await userEvent.click(screen.getByText('login'));
    await waitFor(() => expect(screen.getByTestId('s').textContent).toBe('true'));
    await userEvent.click(screen.getByText('logout'));
    await waitFor(() => expect(screen.getByTestId('s').textContent).toBe('false'));
  });

  it('register não altera isAuthenticated (só cria conta)', async () => {
    function RegConsumer() {
      const { isAuthenticated, register } = useAuth();
      return (
        <div>
          <span data-testid="s">{String(isAuthenticated)}</span>
          <button onClick={() => register('a@b.com', '123', 'X', 'Y', 'Z')}>reg</button>
        </div>
      );
    }
    render(<AuthProvider><RegConsumer /></AuthProvider>);
    await userEvent.click(screen.getByText('reg'));
    await waitFor(() => expect(screen.getByTestId('s').textContent).toBe('false'));
  });

  it('useAuth fora do AuthProvider lança erro', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    function Orphan() { useAuth(); return null; }
    expect(() => render(<Orphan />)).toThrow('useAuth must be used within an AuthProvider');
    spy.mockRestore();
  });
});
