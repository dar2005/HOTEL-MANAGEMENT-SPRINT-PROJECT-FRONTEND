import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if role starts with ROLE_ADMIN or is exactly ADMIN
  const role = authService.getRole();
  if (role && (role === 'ADMIN' || role === 'ROLE_ADMIN')) {
    return true;
  } else {
    router.navigate(['/']); // Redirect unauthorized to home
    return false;
  }
};
