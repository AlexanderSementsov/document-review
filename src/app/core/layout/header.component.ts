import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { Router } from '@angular/router';
import { TokenService } from '../services/token.service';
import { authStore } from '../auth/auth.store';
import { UserRole } from '../../shared/enums/user-role.enum';
import { ConfirmService } from '../services/confirm.service';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatButton, MatTooltip],
  template: `
    <header class="app-header">
      <div class="left-section">
        <h1>Document Review</h1>
      </div>

      <div class="right-section">
        @if (userInfo()) {
          <div class="user-info" [matTooltip]="userInfo()">
            <span>{{ userInfo() }}</span>
          </div>
        }

        <button mat-button color="warn" (click)="logout()">Logout</button>
      </div>
    </header>
  `,
  styleUrls: ['./layout.component.scss']
})
export class HeaderComponent {
  private tokenService = inject(TokenService);
  private confirmService = inject(ConfirmService);
  private router = inject(Router);

  readonly userInfo = computed(() => {
    const user = authStore.user();
    if (!user) return null;

    const roleLabel = user.role === UserRole.REVIEWER ? 'Reviewer' : 'User';
    return `${roleLabel}: ${user.fullName} | ${user.email}`;
  });

  async logout() {
    const confirmed = await this.confirmService.confirm(`Are you sure you want to logout?`);
    if (!confirmed) return;

    this.tokenService.clearToken();
    authStore.clear();
    this.router.navigate(['/login']);
  }
}
