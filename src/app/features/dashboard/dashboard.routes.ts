import { authGuard } from '../../core/guards/auth.guard';
import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { DocumentGridComponent } from './components/document-grid/document-grid.component';
import { DocumentFormComponent } from './components/document-form/document-form.component';

export const dashboardRoutes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'document/new',
        component: DocumentFormComponent
      },
      {
        path: 'document/:id',
        component: DocumentFormComponent
      },
      {
        path: '',
        component: DocumentGridComponent
      },
    ]
  }
];
