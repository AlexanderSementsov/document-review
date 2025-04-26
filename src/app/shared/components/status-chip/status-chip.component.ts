import { Component, computed, input } from '@angular/core';
import { MatChip } from '@angular/material/chips';
import { NgClass, NgIf } from '@angular/common';
import { DocumentStatus } from '../../enums/document-status.enum';

@Component({
  standalone: true,
  selector: 'app-status-chip',
  imports: [
    MatChip,
    NgIf,
    NgClass
  ],
  template: `
    <mat-chip [ngClass]="statusClass()">
      <span class="dot" [ngClass]="statusClass()"></span>
      {{ displayText() }}
    </mat-chip>
  `,
  styleUrls: ['status-chip.component.scss']
})
export class StatusChipComponent {
  status = input<DocumentStatus>();

  readonly statusClass = computed(() => {
    switch (this.status()) {
      case 'DRAFT':
        return 'draft';
      case 'REVOKE':
        return 'revoke';
      case 'READY_FOR_REVIEW':
        return 'ready';
      case 'UNDER_REVIEW':
        return 'under-review';
      case 'APPROVED':
        return 'approved';
      case 'DECLINED':
        return 'declined';
      default:
        return '';
    }
  });

  readonly displayText = computed(() => {
    const raw = this.status();
    if (!raw) return '';

    return raw
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  });
}
