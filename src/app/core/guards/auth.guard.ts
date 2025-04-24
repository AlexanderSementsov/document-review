import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';
import { catchError, map, of, tap } from 'rxjs';
import { authStore } from '../auth/auth.store';

export const authGuard: CanActivateFn = () => {
  const tokenService = inject(TokenService);
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = tokenService.getToken();

  if (!token || tokenService.isTokenExpired()) {
    tokenService.clearToken();
    authStore.clear();
    router.navigate(['/login'], {
      state: { returnUrl: router.url }
    });
    return of(false);
  }

  if (authStore.user()) {
    return of(true);
  }

  return authService.getCurrentUser().pipe(
    tap(user => authStore.setUser(user)),
    map(() => true),
    catchError(() => {
      tokenService.clearToken();
      authStore.clear();
      router.navigate(['/login']);
      return of(false);
    })
  );
};
