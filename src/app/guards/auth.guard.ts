import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check for existing token
  const token = authService.getToken();
  if (token) {
    return true;
  }

  // DEVELOPMENT MODE: If no token but role exists in localStorage, allow access
  // This helps during development when backend isn't available
  const role = localStorage.getItem('role');
  if (role) {
    // Set a mock token so guard thinks user is authenticated
    localStorage.setItem('token', 'mock-dev-token-' + Date.now());
    return true;
  }

  // Otherwise redirect to login
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
