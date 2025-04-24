import { Component, computed, effect, inject, signal } from '@angular/core';
import { DocumentService } from '../../../../core/services/document.service';
import { authStore } from '../../../../core/auth/auth.store';
import { DocumentResDto } from '../../../../shared/interfaces/document/document-res.dto';
import { DocumentStatus } from '../../../../shared/enums/document-status.enum';
import { SortDocumentsEnum } from '../../../../shared/enums/sort-documents.enum';

import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { PaginationParams } from '../../../../shared/types/pagination-params';
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
import { MatButton } from '@angular/material/button';
import { MatPaginator } from '@angular/material/paginator';

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
    MatPaginator
  ]
})
export class DocumentGridComponent {
  private readonly documentService = inject(DocumentService);
  protected readonly isReviewer = authStore.isReviewer;
  private readonly user = authStore.user;

  readonly data = signal<DocumentResDto[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly totalCount = signal<number>(0);

  readonly pageIndex = signal(1);
  readonly pageSize = signal(10);

  // Filters
  readonly statusFilter = signal<DocumentStatus | null>(null);
  readonly creatorEmailFilter = signal<string>('');
  readonly sort = signal<SortDocumentsEnum | null>(null);

  readonly displayedColumns = computed(() =>
    this.isReviewer() ? ['name', 'status', 'creatorEmail', 'updatedAt', 'actions'] : ['name', 'status', 'updatedAt', 'actions']
  );

  readonly reqParams = computed(() => ({
    page: this.pageIndex(),
    size: this.pageSize(),
    status: this.statusFilter() || undefined,
    sort: this.sort() || undefined,
    creatorEmail: this.isReviewer() ? this.creatorEmailFilter() || undefined : undefined,
  }));

  readonly statusOptions = Object.values(DocumentStatus);
  readonly sortOptions: { label: string; value: SortDocumentsEnum }[] = [
    { label: 'Updated', value: SortDocumentsEnum.UPDATED },
    { label: 'Status', value: SortDocumentsEnum.STATUS },
    { label: 'Name (A-Z)', value: SortDocumentsEnum.NAME },
  ];

  constructor() {
    effect(() => {
      const params = this.reqParams();
      this.fetchDocuments(params);
    }, { allowSignalWrites: true });
  }

  fetchDocuments(query: PaginationParams): void {
    this.isLoading.set(true);

    this.documentService.getDocuments(query).subscribe({
      next: res => {
        this.data.set(res.results);
        this.totalCount.set(res.count);
      },
      error: () => this.data.set([]),
      complete: () => this.isLoading.set(false)
    });
  }

  onFilterChange(): void {
    this.pageIndex.set(1);
  }

  onSortChange(newSort: SortDocumentsEnum): void {
    this.sort.set(newSort);
    this.pageIndex.set(1);
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex.set(event.pageIndex || 1);
    this.pageSize.set(event.pageSize);
  }

  viewDocument(id: string): void {
    console.log('Navigate to document:', id);
  }
}
