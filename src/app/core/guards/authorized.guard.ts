import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { TokenService } from '../services/token.service';
import { of } from 'rxjs';

export const authorizedGuard: CanActivateFn = () => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  const token = tokenService.getToken();

  if (token && !tokenService.isTokenExpired()) {
    router.navigate(['/dashboard']);
    return of(false);
  }

  return of(true);
};
