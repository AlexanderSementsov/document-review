import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private snackbar = inject(MatSnackBar);
  private DURATION = 3000;

  show(message: string, action: string = 'Close', duration: number = this.DURATION) {
    this.snackbar.open(message, action, {
      duration,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
}
