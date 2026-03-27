import { QueryClientProvider } from '@tanstack/react-query';
import { Provider as TooltipProvider } from '@radix-ui/react-tooltip';
import { RouterProvider } from 'react-router-dom';
import { queryClient } from '../lib/react-query';
import { router } from './router';
import { AuthProvider } from './AuthProvider';

export function AppProvider() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={300}>
          <RouterProvider router={router} />
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}
