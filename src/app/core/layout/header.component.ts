import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { Router } from '@angular/router';
import { TokenService } from '../services/token.service';
import { authStore } from '../auth/auth.store';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatButton],
  template: `
    <header class="app-header">
      <h1>Document Review</h1>
      <button mat-button (click)="logout()">Logout</button>
    </header>
  `,
})
export class HeaderComponent {
  private tokenService = inject(TokenService);
  private router = inject(Router);

  logout() {
    this.tokenService.clearToken();
    authStore.clear();
    this.router.navigate(['/login']);
  }
}
