import { ApplicationConfig, ENVIRONMENT_INITIALIZER, inject, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, Router } from '@angular/router';

import { routes } from './app.routes';
import { BACKEND_URL } from './shared/tokens/backend-url.token';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { TokenService } from './core/services/token.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { authStore } from './core/auth/auth.store';
import { catchError, firstValueFrom, of } from 'rxjs';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    {
      provide: BACKEND_URL,
      useValue: 'https://legaltech-testing.coobrick.app/api/v1'
    },
    provideAnimationsAsync(),
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue: () => {
        const tokenService = inject(TokenService);
        const router = inject(Router);
        const snackbar = inject(MatSnackBar);

        authStore.init(tokenService, router, snackbar);
      },
    },
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useFactory: () => () => {
        const http = inject(HttpClient);
        const api = inject(BACKEND_URL);
        const router = inject(Router);

        return firstValueFrom(
          http.get(`${api}/health`, { responseType: 'text' }).pipe(
            catchError(() => {
              router.navigate(['/server-unavailable']);
              return of(null);
            })
          )
        );
      }
    },
  ]
};
