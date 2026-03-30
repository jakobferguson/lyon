import axios from 'axios';
import { env } from '../config/env';
import { useAuthStore } from '../stores/authStore';

export const apiClient = axios.create({
  baseURL: `${env.apiUrl}/api`,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  if (env.devAuth) {
    // In dev auth mode, send the dev user's info via headers
    // The backend DevAuthHandler reads these
    const { user, role } = useAuthStore.getState();
    if (user) {
      config.headers['X-Dev-User-Id'] = user.id;
      config.headers['X-Dev-User-Name'] = user.name;
    }
    if (role) {
      config.headers['X-Dev-User-Role'] = role;
    }
  } else {
    // In production, acquire a token from MSAL
    try {
      const { msalInstance } = await import('./msal');
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        const response = await msalInstance.acquireTokenSilent({
          scopes: [`api://${env.msalClientId}/.default`],
          account: accounts[0],
        });
        config.headers.Authorization = `Bearer ${response.accessToken}`;
      }
    } catch {
      // Token acquisition failed — request will proceed without auth
      // and the API will return 401
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearUser();
      window.location.href = '/';
    }
    return Promise.reject(error);
  },
);
