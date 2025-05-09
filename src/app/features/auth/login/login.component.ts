import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TokenService } from '../../../core/services/token.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { authStore } from '../../../core/auth/auth.store';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { catchError, finalize, of, switchMap, tap } from 'rxjs';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    FormFieldComponent
  ]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private tokenService = inject(TokenService);
  protected router = inject(Router);
  private notification = inject(NotificationService);

  isLoading = signal(false);

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  onSubmit() {
    if (this.form.invalid) return;

    this.isLoading.set(true);

    const credentials = this.form.value;

    this.authService.login(credentials).pipe(
      tap(res => this.tokenService.setToken(res.access_token)),
      switchMap(() => this.authService.getCurrentUser()),
      tap(user => {
        authStore.setUser(user);
        const returnUrl = this.router.getCurrentNavigation()?.extras?.state?.['returnUrl'];
        this.router.navigate([returnUrl || '/dashboard']);
      }),

      catchError(err => {
        this.tokenService.clearToken();
        this.notification.show(
          err.status === 401
            ? 'Invalid email or password.'
            : 'Login failed. Please try again.'
        );
        return of(null);
      }),

      finalize(() => this.isLoading.set(false))
    ).subscribe();
  }
}
