import { Component, computed, effect, inject, signal } from '@angular/core';
import { DocumentService } from '../../../../core/services/document.service';
import { authStore } from '../../../../core/auth/auth.store';
import { DocumentResDto } from '../../../../shared/interfaces/document/document-res.dto';
import { DocumentStatus } from '../../../../shared/enums/document-status.enum';
import { SortDocumentsEnum } from '../../../../shared/enums/sort-documents.enum';

import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { MatToolbar } from '@angular/material/toolbar';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatProgressBar } from '@angular/material/progress-bar';
import {
  MatCell, MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef,
  MatRow, MatRowDef,
  MatTable
} from '@angular/material/table';
import { MatInput } from '@angular/material/input';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { UserRole } from '../../../../shared/enums/user-role.enum';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';
import { catchError, combineLatest, EMPTY, switchMap } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-document-grid',
  templateUrl: 'document-grid.component.html',
  styleUrls: ['document-grid.component.scss'],
  imports: [
    MatToolbar,
    MatLabel,
    MatFormField,
    MatSelect,
    MatOption,
    MatProgressBar,
    MatTable,
    MatInput,
    MatButton,
    MatColumnDef,
    MatHeaderCell,
    MatCell,
    MatHeaderRow,
    MatRow,
    MatHeaderCellDef,
    MatCellDef,
    MatRowDef,
    DatePipe,
    NgForOf,
    NgIf,
    MatHeaderRowDef,
    MatPaginator,
    MatIcon,
    MatIconButton
  ]
})
export class DocumentGridComponent {
  private readonly documentService = inject(DocumentService);
  private readonly router = inject(Router);
  private readonly snackbar = inject(MatSnackBar);

  protected readonly isReviewer = authStore.isReviewer;
  protected readonly user = authStore.user;

  readonly data = signal<DocumentResDto[]>([]);
  readonly isLoading = signal(false);
  readonly totalCount = signal(0);

  readonly creatorEmail = signal('');
  readonly creatorId = signal('');

  readonly query = signal({
    page: 1,
    size: 10,
    status: null as DocumentStatus | null,
    sort: null as SortDocumentsEnum | null
  });

  readonly displayedColumns = computed(() =>
    this.isReviewer() ? ['name', 'status', 'creatorEmail', 'updatedAt', 'actions'] : ['name', 'status', 'updatedAt', 'actions']
  );

  readonly statusOptions = this.user()?.role === 'USER' ?
    Object.values(DocumentStatus) :
    Object.values(DocumentStatus).filter(status => status !== DocumentStatus.DRAFT);

  constructor() {
    const query$ = toObservable(this.query);
    const email$ = toObservable(this.creatorEmail).pipe(
      debounceTime(400),
      distinctUntilChanged()
    );
    const uuid$ = toObservable(this.creatorId).pipe(
      debounceTime(400),
      distinctUntilChanged()
    );

    combineLatest([query$, email$, uuid$])
      .pipe(
        switchMap(([query, email, uuid]) => {
          this.isLoading.set(true);
          return this.documentService.getDocuments({
            page: query.page,
            size: query.size,
            status: query.status || undefined,
            sort: query.sort || undefined,
            creatorEmail: this.isReviewer() ? email?.trim() || undefined : undefined,
            creatorId: this.isReviewer() ? uuid?.trim() || undefined : undefined,
          }).pipe(
            catchError(err => {
              console.error('Document loading failed', err);
              this.data.set([]);
              this.totalCount.set(0);
              this.isLoading.set(false);
              return EMPTY;
            })
          );
        })
      )
      .subscribe({
        next: (res) => {
          this.data.set(res.results);
          this.totalCount.set(res.count);
          this.isLoading.set(false);
        },
        error: () => {
          this.data.set([]);
          this.totalCount.set(0);
          this.isLoading.set(false);
        }
      });
  }

  toggleSort(field: 'name' | 'status' | 'updatedAt') {
    const current = this.query().sort;
    const isAsc = current?.startsWith(field) && current.endsWith('asc');
    const newSort = !current || !current.startsWith(field)
      ? `${field}, asc`
      : isAsc
        ? `${field}, desc`
        : null;

    this.query.set({ ...this.query(), sort: newSort as SortDocumentsEnum | null, page: 1 });
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.query.set({ ...this.query(), page: event.pageIndex + 1 || 1, size: event.pageSize });
  }

  onStatusChange(event: DocumentStatus): void {
    this.query.set({ ...this.query(), status: event });
  }

  onEmailInput(value: string) {
    this.creatorEmail.set(value);
  }

  onUuidInput(value: string) {
    this.creatorId.set(value);
  }

  viewDocument(id: string): void {
    if (id) {
      this.router.navigate([`dashboard/document/${id}`]);
    }
  }

  removeDocument(id: string, row: DocumentResDto): void {
    if (id && (row.status === DocumentStatus.DRAFT || row.status === DocumentStatus.REVOKE)) {
      this.documentService.deleteDocument(id).subscribe({
        next: () => {
          this.snackbar.open('Document deleted.', 'Close', { duration: 3000 });
          this.query.set({ ...this.query(), page: 1 });
        },
        error: () => {
          this.snackbar.open('Failed to delete document.', 'Close', { duration: 3000 });
        }
      });
    }
  }

  protected readonly UserRole = UserRole;
  protected readonly DocumentStatus = DocumentStatus;
}
