import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React from 'react';
import { ShellProvider, useShell } from '../../apps/shell/ShellProvider';

// Componente auxiliar que expõe estado do ShellContext no DOM
function ShellInspector() {
  const { user, activeMfe, navigate, permissions, publishEvent, subscribeEvent } = useShell();
  return (
    <div>
      <span data-testid="active-mfe">{activeMfe}</span>
      <span data-testid="user-name">{user.name}</span>
      <span data-testid="user-role">{user.role}</span>
      <span data-testid="permissions">{permissions.join(',')}</span>
      <button onClick={() => navigate('inventory')}>ir para estoque</button>
      <button onClick={() => navigate('purchasing')}>ir para compras</button>
      <button onClick={() => publishEvent('TEST_EVENT', { val: 42 })}>publicar evento</button>
    </div>
  );
}

function renderShell() {
  return render(
    <ShellProvider>
      <ShellInspector />
    </ShellProvider>
  );
}

describe('ShellProvider', () => {
  beforeEach(() => {
    window.location.hash = '';
  });

  it('inicia com activeMfe "ayda-core"', () => {
    renderShell();
    expect(screen.getByTestId('active-mfe')).toHaveTextContent('ayda-core');
  });

  it('navigate muda o activeMfe', async () => {
    renderShell();
    await act(async () => {
      screen.getByText('ir para estoque').click();
    });
    expect(screen.getByTestId('active-mfe')).toHaveTextContent('inventory');
  });

  it('navigate para compras muda o activeMfe', async () => {
    renderShell();
    await act(async () => {
      screen.getByText('ir para compras').click();
    });
    expect(screen.getByTestId('active-mfe')).toHaveTextContent('purchasing');
  });

  it('expõe user com nome e role', () => {
    renderShell();
    expect(screen.getByTestId('user-name').textContent).toBeTruthy();
    expect(screen.getByTestId('user-role').textContent).toBeTruthy();
  });

  it('expõe permissions não vazias', () => {
    renderShell();
    const perms = screen.getByTestId('permissions').textContent;
    expect(perms).toBeTruthy();
    expect(perms!.split(',').length).toBeGreaterThan(0);
  });

  it('publishEvent não lança erro', async () => {
    renderShell();
    await act(async () => {
      expect(() => screen.getByText('publicar evento').click()).not.toThrow();
    });
  });

  it('useShell fora do ShellProvider lança erro', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    function SemProvider() {
      useShell();
      return null;
    }
    expect(() => render(<SemProvider />)).toThrow('useShell must be used within ShellProvider');
    spy.mockRestore();
  });

  it('subscribeEvent retorna função de unsubscribe', () => {
    let unsub: (() => void) | undefined;
    function SubscribeTest() {
      const { subscribeEvent } = useShell();
      React.useEffect(() => {
        unsub = subscribeEvent('SOME_EVENT', vi.fn());
      }, []);
      return null;
    }
    render(<ShellProvider><SubscribeTest /></ShellProvider>);
    expect(typeof unsub).toBe('function');
  });

  it('múltiplas navegações funcionam corretamente', async () => {
    renderShell();
    await act(async () => { screen.getByText('ir para estoque').click(); });
    expect(screen.getByTestId('active-mfe')).toHaveTextContent('inventory');

    await act(async () => { screen.getByText('ir para compras').click(); });
    expect(screen.getByTestId('active-mfe')).toHaveTextContent('purchasing');

    await act(async () => { screen.getByText('ir para estoque').click(); });
    expect(screen.getByTestId('active-mfe')).toHaveTextContent('inventory');
  });
});
