import { createBrowserRouter } from 'react-router-dom';
import { LandingRoute } from '../features/landing/routes/LandingRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingRoute />,
  },
]);
