import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { DocumentService } from '../../../../core/services/document.service';
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
import { NotificationService } from '../../../../core/services/notification.service';
import { ConfirmService } from '../../../../core/services/confirm.service';
import { formatStatus } from '../../../../shared/utils/status-format';

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
  private notification = inject(NotificationService);
  private confirmService = inject(ConfirmService);
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
        this.notification.show('Failed to load document.');
        this.router.navigate(['/dashboard']);
      }
    });
  }

  get nameControl(): FormControl<string> {
    return this.form.get('name') as FormControl<string>;
  }

  onFileChange(event: Event) {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    this.setFile(file);
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
        this.notification.show(`File is too large. Max allowed is ${this.MAX_FILE_SIZE_MB} MB.`);
        return;
      }

      if (!this.ALLOWED_FILE_TYPES.includes(file.type)) {
        this.notification.show(`Unsupported file type: ${file.type}`);
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
        this.notification.show(`Document saved with status "${status}" successfully.`);
        this.router.navigate(['/dashboard/document', res.id]);
      },
      error: () => {
        this.notification.show('Failed to save document.');
      }
    });
  }

  async revokeDocument() {
    if (!this.documentId()) return;

    const confirmed = await this.confirmService.confirm('Are you sure you want to revoke this document?');
    if (!confirmed) return;

    this.documentService.getDocumentById(this.documentId()!)
      .pipe(
        switchMap(doc => {
          if (doc.status !== DocumentStatus.READY_FOR_REVIEW) {
            this.notification.show('Document is not ready for review.');
            return EMPTY;
          }
          return this.documentService.revokeDocumentReview(this.documentId()!);
        }),
        tap(() => {
          this.notification.show('Document revoked.');
          this.loadDocument(this.documentId()!);
        }),
        catchError(() => {
          this.notification.show('Failed to revoke document.');
          return EMPTY;
        })
      )
      .subscribe();
  }

  async sendToReview() {
    if (!this.documentId()) return;

    const confirmed = await this.confirmService.confirm('Are you sure you want to send to review this document?');
    if (!confirmed) return;

    this.documentService.sendDocumentToReview(this.documentId()!).pipe(
      tap(() => {
        this.notification.show('Document was sent to review.');
        this.loadDocument(this.documentId()!);
      }),
      catchError(() => {
        this.notification.show('Failed to send document to review.');
        return EMPTY;
      })
    ).subscribe()
  }

  async deleteDocument() {
    if (!this.documentId() || !this.canDelete()) return;

    const confirmed = await this.confirmService.confirm('Are you sure you want to delete this document?');
    if (!confirmed) return;

    this.documentService.deleteDocument(this.documentId()!).subscribe({
      next: () => {
        this.notification.show('Document deleted.');
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.notification.show('Failed to delete.');
      }
    });
  }

  readonly canRename = computed(() => {
    const data = this.fileData();
    return (
      this.isEditMode() &&
      data &&
      this.userRole() === UserRole.USER &&
      [DocumentStatus.DRAFT, DocumentStatus.REVOKE].includes(data?.status!)
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
      [DocumentStatus.DRAFT, DocumentStatus.REVOKE].includes(data?.status!)
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
          this.notification.show('Document name updated.');
          this.isRenaming.set(false);
          this.loadDocument(this.documentId()!);
        },
        error: () => {
          this.notification.show('Failed to update name.');
        }
      });
    }
  }

  async changeStatus(newStatus: ReviewerDocumentStatus) {
    if (!this.documentId()) return;

    const confirmed = await this.confirmService.confirm(`Are you sure you want to change document status to ${formatStatus(newStatus)}?`);
    if (!confirmed) return;

    this.documentService.changeDocumentStatus(this.documentId()!, newStatus).subscribe({
      next: () => {
        this.notification.show(`Status changed to ${newStatus}`);
        this.loadDocument(this.documentId()!);
      },
      error: () => {
        this.notification.show('Failed to change status.');
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
    const file = event.dataTransfer?.files?.[0];
    this.setFile(file);
  }

  private setFile(file?: File) {
    if (!file) return;

    if (file.size > this.MAX_FILE_SIZE_MB * 1024 * 1024) {
      this.notification.show(`File is too large. Max allowed is 20 MB.`);
      return;
    }

    if (!this.ALLOWED_FILE_TYPES.includes(file.type)) {
      this.notification.show(`Unsupported file type: ${file.type}`);
      return;
    }

    this.selectedFile.set(file);
    this.form.get('file')?.setValue(file);

    const reader = new FileReader();
    reader.onload = () => {
      this.fileUrl.set(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  protected readonly DocumentStatus = DocumentStatus;
}
