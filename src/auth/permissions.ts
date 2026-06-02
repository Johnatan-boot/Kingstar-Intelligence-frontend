// src/auth/permissions.ts
// Fonte única de verdade do RBAC no frontend. Espelha o backend (shared/auth/roles.ts).

export type Funcao =
  | 'SUPER_ADMIN' | 'ADMIN' | 'GESTOR'
  | 'COMPRAS' | 'PCL' | 'ANALITICA'
  | 'RECEBIMENTO' | 'CONFERENCIA' | 'ESTOQUE';

// Perfis com acesso total à plataforma (todas as telas + dados sigilosos).
export const ACESSO_TOTAL: Funcao[] = ['SUPER_ADMIN', 'ADMIN', 'GESTOR', 'COMPRAS', 'PCL', 'ANALITICA'];

// Telas (MFE ids) liberadas para o perfil operário.
const MFES_OPERARIO = ['receiving', 'conference', 'schedule', 'inventory'];

// Todas as telas existentes no Shell.
const MFES_TODAS = [
  'purchasing', 'receiving', 'conference', 'schedule',
  'inventory', 'analytics', 'finance', 'ayda-core',
];

export function temAcessoTotal(funcao?: string): boolean {
  return !!funcao && ACESSO_TOTAL.includes(funcao as Funcao);
}

/** MFE ids que o perfil pode acessar. */
export function mfesPermitidos(funcao?: string): string[] {
  return temAcessoTotal(funcao) ? MFES_TODAS : MFES_OPERARIO;
}

/** Pode ver informações sigilosas (nº de NF, valor de mercadoria)? */
export function podeVerSigiloso(funcao?: string): boolean {
  return temAcessoTotal(funcao);
}

/** Rótulo amigável da função, para exibir no menu/perfil. */
export function rotuloFuncao(funcao?: string): string {
  const mapa: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin', ADMIN: 'Administrador', GESTOR: 'Gestor',
    COMPRAS: 'Gestor de Compras', PCL: 'Gestor PCL', ANALITICA: 'Analítica',
    RECEBIMENTO: 'Operador — Recebimento', CONFERENCIA: 'Operador — Conferência',
    ESTOQUE: 'Operador — Estoque',
  };
  return (funcao && mapa[funcao]) || funcao || 'Usuário';
}
