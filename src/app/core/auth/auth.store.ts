import { computed, inject, signal } from '@angular/core';
import { UserResDto } from '../../shared/interfaces/user-res.dto';
import { UserRole } from '../../shared/enums/user-role.enum';
import { TokenService } from '../services/token.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

let _tokenService: TokenService;
let _router: Router;
let _snackbar: MatSnackBar;

const _user = signal<UserResDto | null>(null);
let logoutTimer: ReturnType<typeof setTimeout> | null = null;

export const authStore = {
  init(tokenService: TokenService, router: Router, snackbar: MatSnackBar) {
    _tokenService = tokenService;
    _router = router;
    _snackbar = snackbar;
  },

  user: _user,
  isAuthenticated: computed(() => !!_user()),
  isReviewer: computed(() => _user()?.role === UserRole.REVIEWER),
  isUser: computed(() => _user()?.role === UserRole.USER),

  setUser: (user: UserResDto) => {
    _user.set(user);
    authStore.startAutoLogoutTimer();
  },

  clear: () => {
    _user.set(null);
    if (logoutTimer) {
      clearTimeout(logoutTimer);
      logoutTimer = null;
    }
  },

  startAutoLogoutTimer: () => {
    const exp = _tokenService.getTokenExpiration();
    if (!exp) return;

    const now = Math.floor(Date.now() / 1000);
    const timeout = (exp - now - 60) * 1000;

    if (timeout <= 0) {
      authStore.forceLogoutWithNotice();
      return;
    }

    if (logoutTimer) clearTimeout(logoutTimer);

    logoutTimer = setTimeout(() => {
      _snackbar.open('Session is about to expire', 'OK', { duration: 6000 });
      setTimeout(() => authStore.forceLogoutWithNotice(), 6000);
    }, timeout);
  },

  forceLogoutWithNotice: () => {
    _snackbar.open('Session expired. Please login again.', 'Close', { duration: 4000 });
    _tokenService.clearToken();
    authStore.clear();
    _router.navigate(['/login']);
  }
};
