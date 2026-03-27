import { PublicClientApplication, LogLevel, type Configuration } from '@azure/msal-browser';

const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_MSAL_CLIENT_ID ?? '',
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_MSAL_TENANT_ID ?? 'common'}`,
    redirectUri: import.meta.env.VITE_MSAL_REDIRECT_URI ?? window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.log(`[MSAL][${LogLevel[level]}] ${message}`);
        }
      },
      logLevel: LogLevel.Warning,
    },
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);

export const loginRequest = {
  scopes: ['openid', 'profile', 'email'],
};
