import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { authorizedGuard } from './core/guards/authorized.guard';
import { dashboardRoutes } from './features/dashboard/dashboard.routes';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [authorizedGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    canActivate: [authorizedGuard],
    loadComponent: () =>
      import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () => Promise.resolve(dashboardRoutes)
  },
  {
    path: 'server-unavailable',
    loadComponent: () =>
      import('./features/server-unavailable/server-unavailable.component').then(m => m.ServerUnavailableComponent)
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
