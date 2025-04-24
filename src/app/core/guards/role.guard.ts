import { CanActivateFn, Router } from '@angular/router';
import { of } from 'rxjs';
import { UserRole } from '../../shared/enums/user-role.enum';
import { authStore } from '../auth/auth.store';
import { inject } from '@angular/core';

export const roleGuard= (expectedRole: UserRole):CanActivateFn => () => {
  const router = inject(Router);

  const user = authStore.user();
  if (!user) {
    router.navigate(['/login']);
    return of(false);
  }

  if (user.role === expectedRole) {
    return of(true);
  }

  router.navigate(['/dashboard']);
  return of(false);
}
