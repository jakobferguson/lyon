import { type ReactNode, useEffect } from 'react';
import { MsalProvider, useMsal } from '@azure/msal-react';
import { msalInstance } from '../lib/msal';
import { useAuthStore } from '../stores/authStore';
import type { Role, Division } from '../types';

const DEV_AUTH = import.meta.env.VITE_DEV_AUTH === 'true';

// ── Prod: syncs MSAL account claims → auth store ──────────────────────────
function MsalAccountSync({ children }: { children: ReactNode }) {
  const { accounts } = useMsal();
  const setUser = useAuthStore((s) => s.setUser);
  const clearUser = useAuthStore((s) => s.clearUser);

  useEffect(() => {
    if (accounts.length === 0) {
      clearUser();
      return;
    }
    const account = accounts[0];
    const claims = account.idTokenClaims as Record<string, unknown>;
    const role = (claims?.['roles'] as string[])?.[0] as Role | undefined;
    const division = (claims?.['division'] as Division) ?? null;

    setUser(
      {
        id: account.localAccountId,
        name: account.name ?? '',
        email: account.username,
      },
      role ?? 'field_reporter',
      division,
    );
  }, [accounts, setUser, clearUser]);

  return <>{children}</>;
}

// ── Public API ─────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  if (DEV_AUTH) {
    // In dev mode the auth store is written to directly by DevLoginRoute.
    // No MSAL wrapper needed.
    return <>{children}</>;
  }

  return (
    <MsalProvider instance={msalInstance}>
      <MsalAccountSync>{children}</MsalAccountSync>
    </MsalProvider>
  );
}
