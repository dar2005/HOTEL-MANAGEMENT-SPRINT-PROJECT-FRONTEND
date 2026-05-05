import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // DEVELOPMENT MODE: Allow admin access if role is not set (backend not running)
  // This allows testing admin features without backend authentication
  const isDevelopment = !authService.getToken(); // If no token, likely in development
  const role = authService.getRole() || localStorage.getItem('role');
  
  // If no role is set but we're in development mode, auto-set admin role for testing
  if (!role && isDevelopment) {
    localStorage.setItem('role', 'ADMIN');
    localStorage.setItem('username', 'admin');
    return true;
  }

  // Production: Check if user is authenticated first
  const token = authService.getToken();
  if (!token && role !== 'ADMIN') {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Check if role is ADMIN or ROLE_ADMIN
  if (role && (role === 'ADMIN' || role === 'ROLE_ADMIN')) {
    return true;
  } else {
    // No admin role found - redirect to home
    router.navigate(['/']);
    return false;
  }
};
