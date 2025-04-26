import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    <h2 mat-dialog-title class="dialog-title">{{ data.title || 'Confirm' }}</h2>

    <mat-dialog-content class="dialog-content">
      {{ data.message }}
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close class="cancel-button">Cancel</button>
      <button mat-raised-button color="warn" (click)="confirm()" class="confirm-button">
        Confirm
      </button>
    </mat-dialog-actions>
  `,
  imports: [
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    NgIf,
    MatDialogClose
  ]
})
export class ConfirmDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title?: string; message: string }
  ) {}

  confirm() {
    this.dialogRef.close(true);
  }
}
