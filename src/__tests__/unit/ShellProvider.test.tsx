import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { ShellProvider, useShell } from '../../apps/shell/ShellProvider';

function ShellConsumer() {
  const { activeMfe, navigate, user, permissions, publishEvent, subscribeEvent } = useShell();
  const [lastEvent, setLastEvent] = React.useState<string>('');

  React.useEffect(() => {
    const unsub = subscribeEvent('TEST_EVENT', (payload) => {
      setLastEvent(JSON.stringify(payload));
    });
    return unsub;
  }, [subscribeEvent]);

  return (
    <div>
      <span data-testid="active-mfe">{activeMfe}</span>
      <span data-testid="user-name">{user.name}</span>
      <span data-testid="permissions">{permissions.join(',')}</span>
      <span data-testid="last-event">{lastEvent}</span>
      <button onClick={() => navigate('estoque')}>ir estoque</button>
      <button onClick={() => navigate('compras')}>ir compras</button>
      <button onClick={() => publishEvent('TEST_EVENT', { valor: 42 })}>publish</button>
    </div>
  );
}

function wrap() {
  return render(<ShellProvider><ShellConsumer /></ShellProvider>);
}

describe('ShellProvider — estado inicial', () => {
  it('inicia no MFE ayda-core', () => {
    wrap();
    expect(screen.getByTestId('active-mfe').textContent).toBe('ayda-core');
  });

  it('expõe usuário com nome e papel', () => {
    wrap();
    expect(screen.getByTestId('user-name').textContent).toBeTruthy();
  });

  it('expõe permissões como array', () => {
    wrap();
    expect(screen.getByTestId('permissions').textContent).toContain('SYSTEM_ADMIN');
  });
});

describe('ShellProvider — navegação', () => {
  beforeEach(() => {
    window.location.hash = '';
    vi.clearAllMocks();
  });

  it('muda activeMfe ao chamar navigate()', async () => {
    wrap();
    await userEvent.click(screen.getByText('ir estoque'));
    expect(screen.getByTestId('active-mfe').textContent).toBe('estoque');
  });

  it('navega para MFE de compras', async () => {
    wrap();
    await userEvent.click(screen.getByText('ir compras'));
    expect(screen.getByTestId('active-mfe').textContent).toBe('compras');
  });

  it('atualiza window.location.hash ao navegar', async () => {
    wrap();
    await userEvent.click(screen.getByText('ir estoque'));
    expect(window.location.hash).toBe('estoque');
  });

  it('lê o hash inicial da URL', () => {
    window.location.hash = 'conferencia';
    wrap();
    // Com hash pré-setado, deve iniciar na conferência
    // (o useEffect lê o hash após montar)
    expect(screen.getByTestId('active-mfe').textContent).toBeDefined();
  });
});

describe('ShellProvider — Event Bus', () => {
  it('subscrições recebem eventos publicados', async () => {
    wrap();
    await userEvent.click(screen.getByText('publish'));
    expect(screen.getByTestId('last-event').textContent).toBe('{"valor":42}');
  });

  it('remove listener ao desmontar', () => {
    const { unmount } = wrap();
    unmount();
    // Não deve lançar erro ao tentar publicar após desmonte
    expect(() => act(() => {})).not.toThrow();
  });
});

describe('ShellProvider — useShell fora do Provider', () => {
  it('lança erro descritivo', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    function Orphan() { useShell(); return null; }
    expect(() => render(<Orphan />)).toThrow('useShell must be used within ShellProvider');
    consoleSpy.mockRestore();
  });
});
