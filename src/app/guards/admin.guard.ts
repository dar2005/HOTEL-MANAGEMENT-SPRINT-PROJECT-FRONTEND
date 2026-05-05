import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const role = authService.getRole();
  if (role === 'ADMIN') {
    return true;
  } else {
    router.navigate(['/']); // Redirect unauthorized to home
    return false;
  }
};
