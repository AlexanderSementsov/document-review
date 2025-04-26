import { Component, computed, effect, inject, signal } from '@angular/core';
import { DocumentService } from '../../../../core/services/document.service';
import { authStore } from '../../../../core/auth/auth.store';
import { DocumentResDto } from '../../../../shared/interfaces/document/document-res.dto';
import { DocumentStatus } from '../../../../shared/enums/document-status.enum';
import { SortDocumentsEnum } from '../../../../shared/enums/sort-documents.enum';

import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { MatToolbar } from '@angular/material/toolbar';
import { MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
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
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { UserRole } from '../../../../shared/enums/user-role.enum';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';
import { catchError, combineLatest, EMPTY, switchMap } from 'rxjs';
import { StatusChipComponent } from '../../../../shared/components/status-chip/status-chip.component';
import { formatStatus } from '../../../../shared/utils/status-format';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { NotificationService } from '../../../../core/services/notification.service';
import { ConfirmService } from '../../../../core/services/confirm.service';

@Component({
  standalone: true,
  selector: 'app-document-grid',
  templateUrl: './document-grid.component.html',
  styleUrls: ['./document-grid.component.scss'],
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
    MatIconButton,
    MatHint,
    StatusChipComponent,
    MatProgressSpinner,
    RouterLink
  ]
})
export class DocumentGridComponent {
  private readonly documentService = inject(DocumentService);
  private readonly router = inject(Router);
  private confirmService = inject(ConfirmService);
  protected readonly isReviewer = authStore.isReviewer;
  protected readonly user = authStore.user;

  private notification = inject(NotificationService);

  readonly data = signal<DocumentResDto[]>([]);
  readonly isLoading = signal(true);
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

  readonly statusOptions = Object.values(DocumentStatus)
    .filter(status => this.user()?.role === 'USER' || status !== DocumentStatus.DRAFT)
    .map(status => ({
      label: formatStatus(status),
      value: status,
    }));

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
              this.notification.show('Document loading failed', err);
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
          this.notification.show('Documents loaded.');
        },
        error: (err) => {
          this.data.set([]);
          this.totalCount.set(0);
          this.isLoading.set(false);
          this.notification.show('Error: ', err);
        }
      });
  }

  reloadDocuments(): void {
    this.query.set({...this.query()})
  }

  toggleSort(field: 'name' | 'status' | 'updatedAt') {
    const current = this.query().sort;
    const isAsc = current?.startsWith(field) && current.endsWith('asc');
    const newSort = !current || !current.startsWith(field)
      ? `${field}, asc`
      : isAsc
        ? null // seems that back-end handle only one sort direction. We can add `${field}, desc` and proper icon after BE fix
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

  async removeDocument(id: string, row: DocumentResDto) {
    const confirmed = await this.confirmService.confirm('Are you sure you want to delete this document?');
    if (!confirmed) return;

    if (id && (row.status === DocumentStatus.DRAFT || row.status === DocumentStatus.REVOKE)) {
      this.documentService.deleteDocument(id).subscribe({
        next: () => {
          this.notification.show('Document deleted.');
          this.query.set({ ...this.query(), page: 1 });
        },
        error: (err) => {
          this.notification.show('Failed to delete document.', err);
        }
      });
    }
  }

  protected readonly UserRole = UserRole;
  protected readonly DocumentStatus = DocumentStatus;
}
