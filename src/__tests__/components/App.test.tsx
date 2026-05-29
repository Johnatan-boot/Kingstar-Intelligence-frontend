import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React from 'react';

// ── App.tsx — fluxo de autenticação ──────────────────────────────────
const mockLogin  = vi.fn().mockResolvedValue(undefined);
const mockLogout = vi.fn();

vi.mock('../../context/AuthContext', async (importOriginal) => {
  const original = await importOriginal<any>();
  let _authenticated = false;

  return {
    ...original,
    AuthProvider: ({ children }: any) => <div>{children}</div>,
    useAuth: () => ({
      isAuthenticated: _authenticated,
      login: async (...args: any[]) => {
        await mockLogin(...args);
        _authenticated = true;
      },
      logout: () => { _authenticated = false; mockLogout(); },
      register: vi.fn().mockResolvedValue(undefined),
    }),
  };
});

// Mock dos MFEs pesados para não tentar lazy import no jsdom
vi.mock('../../apps/mfe-ayda', () => ({ AydaCoreMfe: () => <div>AYDA MFE</div> }));
vi.mock('../../apps/mfe-estoque', () => ({ InventoryMfe: () => <div>Estoque MFE</div> }));
vi.mock('../../apps/mfe-compras', () => ({ PurchasingMfe: () => <div>Compras MFE</div> }));
vi.mock('../../apps/mfe-recebimento', () => ({ ReceivingMfe: () => <div>Recebimento MFE</div> }));
vi.mock('../../apps/mfe-conferencia', () => ({ ConferenceMfe: () => <div>Conferencia MFE</div> }));
vi.mock('../../apps/mfe-analytics', () => ({ AnalyticsMfe: () => <div>Analytics MFE</div> }));
vi.mock('../../apps/mfe-agenda', () => ({ AgendaMfe: () => <div>Agenda MFE</div> }));
vi.mock('../../apps/mfe-financeiro', () => ({ FinanceiroMfe: () => <div>Financeiro MFE</div> }));
vi.mock('../../components/AydaWidget', () => ({ default: () => null }));

describe('App — roteamento por autenticação', () => {
  it('renderiza AuthPage quando não autenticado', async () => {
    const { default: App } = await import('../../App');
    render(<App />);
    // AuthPage tem o título KingStar WMS
    expect(screen.getByText('KingStar WMS')).toBeInTheDocument();
  });
});

// ── ModuleErrorBoundary ───────────────────────────────────────────────
class ModuleErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div data-testid="error-fallback">
          ⚠️ Módulo indisponível: {this.state.error?.message}
        </div>
      );
    }
    return this.props.children;
  }
}

function ThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('MFE falhou ao carregar');
  return <div data-testid="ok">MFE funcionando</div>;
}

describe('ModuleErrorBoundary', () => {
  it('renderiza children quando não há erro', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ModuleErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </ModuleErrorBoundary>
    );
    expect(screen.getByTestId('ok')).toHaveTextContent('MFE funcionando');
    spy.mockRestore();
  });

  it('renderiza fallback de erro quando filho lança exceção', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ModuleErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ModuleErrorBoundary>
    );
    expect(screen.getByTestId('error-fallback')).toBeInTheDocument();
    expect(screen.getByTestId('error-fallback')).toHaveTextContent('MFE falhou ao carregar');
    spy.mockRestore();
  });

  it('mensagem de erro exibe o texto correto', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ModuleErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ModuleErrorBoundary>
    );
    expect(screen.getByTestId('error-fallback')).toHaveTextContent('Módulo indisponível');
    spy.mockRestore();
  });

  it('children saudável não dispara o fallback', () => {
    render(
      <ModuleErrorBoundary>
        <div data-testid="child">filho ok</div>
      </ModuleErrorBoundary>
    );
    expect(screen.queryByTestId('error-fallback')).not.toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
