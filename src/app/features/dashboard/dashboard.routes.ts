import { authGuard } from '../../core/guards/auth.guard';
import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { DocumentGridComponent } from './components/document-grid/document-grid.component';

export const dashboardRoutes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: DocumentGridComponent
      },
      {
        path: 'document/:id',
        component: DashboardComponent
      }
    ]
  }
];
