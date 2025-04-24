import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';
import { RouterOutlet } from '@angular/router';
import { PdfViewerComponent } from '../../shared/components/pdf-viewer/pdf-viewer.component';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    FormFieldComponent,
    RouterOutlet,
    PdfViewerComponent
  ]
})
export class DashboardComponent {}
