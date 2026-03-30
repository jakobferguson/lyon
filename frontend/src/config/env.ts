export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:5000',
  devAuth: import.meta.env.VITE_DEV_AUTH === 'true',
  msalClientId: import.meta.env.VITE_MSAL_CLIENT_ID ?? '',
  msalTenantId: import.meta.env.VITE_MSAL_TENANT_ID ?? '',
  msalRedirectUri: import.meta.env.VITE_MSAL_REDIRECT_URI ?? window.location.origin,
} as const;
