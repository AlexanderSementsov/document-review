import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../services/token.service';
import { BACKEND_URL } from '../../shared/tokens/backend-url.token';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const token = tokenService.getToken();
  const domain = inject(BACKEND_URL);

  if (!token || !req.url.startsWith(domain)) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders:{
      Authorization: `Bearer ${token}`
    }
  })

  return next(authReq);
}
