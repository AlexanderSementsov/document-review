import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { AuthService } from '../../../core/services/auth.service';
import { TokenService } from '../../../core/services/token.service';
import { authStore } from '../../../core/auth/auth.store';
import { catchError, concatMap, exhaustMap, finalize, of, tap } from 'rxjs';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { UserRole } from '../../../shared/enums/user-role.enum';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  standalone: true,
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    FormFieldComponent,
    MatProgressSpinner,
    MatFormField,
    MatSelect,
    MatOption,
    MatLabel
  ]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private tokenService = inject(TokenService);
  protected router = inject(Router);
  private notification = inject(NotificationService);

  readonly roles = [
    { value: UserRole.USER, label: 'User' },
    { value: UserRole.REVIEWER, label: 'Reviewer' }
  ];

  isLoading = signal(false);

  form: FormGroup = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
    role: [UserRole.USER, Validators.required]
  }, { validators: this.passwordsMatch });

  get confirmPasswordError(): boolean {
    return !!(this.form.hasError('passwordMismatch') && this.form.get('confirmPassword')?.touched);
  }

  private passwordsMatch(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    const { confirmPassword, ...dto } = this.form.value;

    this.authService.register(dto).pipe(
      exhaustMap(() =>
        of(dto).pipe(
          concatMap(credentials => this.authService.login({ email: credentials.email, password: credentials.password })),
          tap(res => this.tokenService.setToken(res.access_token)),
          concatMap(() => this.authService.getCurrentUser())
        )
      ),
      tap(user => {
        authStore.setUser(user);
        this.router.navigate(['/dashboard']);
      }),
      catchError((err) => {
        this.notification.show('Registration failed. Please try again. ', err?.error?.message || '');
        return of(null);
      }),
      finalize(() => this.isLoading.set(false))
    ).subscribe();
  }

}
