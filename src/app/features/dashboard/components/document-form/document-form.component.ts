import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { DocumentService } from '../../../../core/services/document.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButton, MatFabButton, MatIconButton } from '@angular/material/button';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PdfViewerComponent } from '../../../../shared/components/pdf-viewer/pdf-viewer.component';
import { DocumentStatus, ReviewerDocumentStatus } from '../../../../shared/enums/document-status.enum';
import { DocumentResDto } from '../../../../shared/interfaces/document/document-res.dto';
import { catchError, EMPTY, switchMap, tap } from 'rxjs';
import { authStore } from '../../../../core/auth/auth.store';
import { UserRole } from '../../../../shared/enums/user-role.enum';
import { MatIcon } from '@angular/material/icon';
import { StatusChipComponent } from '../../../../shared/components/status-chip/status-chip.component';
import { FormFieldComponent } from '../../../../shared/components/form-field/form-field.component';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-document-form',
  templateUrl: './document-form.component.html',
  styleUrls: ['./document-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    MatButton,
    MatLabel,
    MatError,
    PdfViewerComponent,
    NgIf,
    RouterLink,
    MatIconButton,
    MatFabButton,
    MatIcon,
    StatusChipComponent,
    FormFieldComponent,
    MatTooltip,
  ]
})
export class DocumentFormComponent {
  private fb = inject(FormBuilder);
  private documentService = inject(DocumentService);
  private snackbar = inject(MatSnackBar);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private readonly MAX_FILE_SIZE_MB = 20;
  private readonly ALLOWED_FILE_TYPES = ['application/pdf'];

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    file: [null, Validators.required]
  });


  readonly userRole = computed(() => authStore.user()?.role || null);

  selectedFile = signal<File | null>(null);
  fileUrl = signal<string | null>(null);
  isEditMode = signal(false);
  documentId = signal<string | null>(null);
  fileData = signal<DocumentResDto | null>(null);
  isRenaming = signal(false);

  constructor() {
    effect(() => {
      const id = this.route.snapshot.paramMap.get('id');
      if (id && id !== 'new') {
        this.isEditMode.set(true);
        this.documentId.set(id);
        this.loadDocument(id);
      }
    }, { allowSignalWrites: true });
  }

  private loadDocument(id: string): void {
    this.documentService.getDocumentById(id).subscribe({
      next: doc => {
        this.form.patchValue({ name: doc.name });
        this.fileUrl.set(doc.fileUrl);
        this.fileData.set(doc);
        this.form.get('file')?.clearValidators();
        this.form.get('file')?.updateValueAndValidity();
      },
      error: () => {
        this.snackbar.open('Failed to load document.', 'Close', { duration: 3000 });
        this.router.navigate(['/dashboard']);
      }
    });
  }

  get nameControl(): FormControl<string> {
    return this.form.get('name') as FormControl<string>;
  }

  onFileChange(event: Event) {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (file && file.type === 'application/pdf') {
      this.selectedFile.set(file);
      this.form.get('file')?.setValue(file);

      const fileReader = new FileReader();
      fileReader.onload = () => {
        this.fileUrl.set(fileReader.result as string);
      };
      fileReader.readAsDataURL(file);
    } else {
      this.snackbar.open('Only PDF files are supported.', 'Close', { duration: 3000 });
    }
  }

  saveAsDraft() {
    this.submitDocument(DocumentStatus.DRAFT);
  }

  submitToReview() {
    this.submitDocument(DocumentStatus.READY_FOR_REVIEW);
  }

  private submitDocument(status: DocumentStatus) {
    if (this.form.invalid || (!this.selectedFile() && !this.fileUrl())) return;

    const file = this.selectedFile();
    if (file) {
      if (file.size > this.MAX_FILE_SIZE_MB * 1024 * 1024) {
        this.snackbar.open(`File is too large. Max allowed is ${this.MAX_FILE_SIZE_MB} MB.`, 'Close', { duration: 3000 });
        return;
      }

      if (!this.ALLOWED_FILE_TYPES.includes(file.type)) {
        this.snackbar.open(`Unsupported file type: ${file.type}`, 'Close', { duration: 3000 });
        return;
      }
    }

    const formData = new FormData();
    formData.append('name', this.form.value.name!);
    if (file) {
      formData.append('file', file);
    }
    formData.append('status', status);

    this.documentService.uploadDocument(formData).subscribe({
      next: res => {
        this.snackbar.open(`Document saved with status "${status}" successfully.`, 'Close', { duration: 3000 });
        this.router.navigate(['/dashboard/document', res.id]);
      },
      error: () => {
        this.snackbar.open('Failed to save document.', 'Close', { duration: 3000 });
      }
    });
  }

  revokeDocument() {
    if (!this.documentId()) return;

    this.documentService.getDocumentById(this.documentId()!)
      .pipe(
        switchMap(doc => {
          if (doc.status !== DocumentStatus.READY_FOR_REVIEW) {
            this.snackbar.open('Document cannot be revoked because it is not ready for review.', 'Close', { duration: 3000 });
            return EMPTY;
          }
          return this.documentService.revokeDocumentReview(this.documentId()!);
        }),
        tap(() => {
          this.snackbar.open('Document revoked.', 'Close', { duration: 3000 });
          this.loadDocument(this.documentId()!);
        }),
        catchError(() => {
          this.snackbar.open('Failed to revoke or load document.', 'Close', { duration: 3000 });
          return EMPTY;
        })
      )
      .subscribe();
  }

  sendToReview() {
    if (!this.documentId()) return;

    this.documentService.sendDocumentToReview(this.documentId()!).pipe(
      tap(() => {
        this.snackbar.open('Document was sent to review.', 'Close', { duration: 3000 });
        this.loadDocument(this.documentId()!);
      }),
      catchError(() => {
        this.snackbar.open('Failed to send document to review.', 'Close', { duration: 3000 });
        return EMPTY;
      })
    ).subscribe()
  }

  deleteDocument() {
    if (!this.documentId() || !this.canDelete()) return;

    this.documentService.deleteDocument(this.documentId()!).subscribe({
      next: () => {
        this.snackbar.open('Document deleted.', 'Close', { duration: 3000 });
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.snackbar.open('Failed to delete.', 'Close', { duration: 3000 });
      }
    });
  }

  readonly canRename = computed(() => {
    const data = this.fileData();
    return (
      this.isEditMode() &&
      data &&
      this.userRole() === UserRole.USER &&
      (data.status === DocumentStatus.DRAFT || data.status === DocumentStatus.REVOKE)
    );
  });

  readonly canRevoke = computed(() => {
    const data = this.fileData();
    return (
      this.isEditMode() &&
      data &&
      this.userRole() === UserRole.USER &&
      data.status === DocumentStatus.READY_FOR_REVIEW
    );
  });

  readonly canBeReviewed = computed(() => {
    const data = this.fileData();
    return (
      this.isEditMode() &&
      data &&
      this.userRole() === UserRole.USER &&
      data.status === DocumentStatus.DRAFT
    );
  });

  readonly canDelete = computed(() => {
    const data = this.fileData();
    return (
      this.isEditMode() &&
      data &&
      this.userRole() === UserRole.USER &&
      (data.status === DocumentStatus.DRAFT || data.status === DocumentStatus.REVOKE)
    );
  });

  readonly canApproveOrDecline = computed(() => {
    const data = this.fileData();
    return (
      this.userRole() === UserRole.REVIEWER &&
      (data?.status === DocumentStatus.UNDER_REVIEW)
    );
  });

  readonly canStartReview = computed(() => {
    const data = this.fileData();
    return (
      this.userRole() === UserRole.REVIEWER
      && data?.status === DocumentStatus.READY_FOR_REVIEW
    );
  });

  startRenaming() {
    if (this.canRename()) {
      this.isRenaming.set(true);
    }
  }

  saveNewName() {
    const newName = this.nameControl.value;
    if (newName && this.documentId()) {
      this.documentService.updateDocumentName(this.documentId()!, newName).subscribe({
        next: () => {
          this.snackbar.open('Document name updated.', 'Close', { duration: 3000 });
          this.isRenaming.set(false);
          this.loadDocument(this.documentId()!);
        },
        error: () => {
          this.snackbar.open('Failed to update name.', 'Close', { duration: 3000 });
        }
      });
    }
  }

  changeStatus(newStatus: ReviewerDocumentStatus) {
    if (!this.documentId()) return;

    this.documentService.changeDocumentStatus(this.documentId()!, newStatus).subscribe({
      next: () => {
        this.snackbar.open(`Status changed to ${newStatus}`, 'Close', { duration: 3000 });
        this.loadDocument(this.documentId()!);
      },
      error: () => {
        this.snackbar.open('Failed to change status.', 'Close', { duration: 3000 });
      }
    });
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDropFile(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];

      if (file?.type === 'application/pdf') {
        this.selectedFile.set(file);
        this.form.get('file')?.setValue(file);

        const fileReader = new FileReader();
        fileReader.onload = () => {
          this.fileUrl.set(fileReader.result as string);
        };
        fileReader.readAsDataURL(file);
      } else {
        this.snackbar.open('Only PDF files are supported.', 'Close', { duration: 3000 });
      }
    }


  }

  protected readonly DocumentStatus = DocumentStatus;
}
