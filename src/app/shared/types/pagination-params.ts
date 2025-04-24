import { DocumentStatus } from '../enums/document-status.enum';
import { SortDocumentsEnum } from '../enums/sort-documents.enum';

export interface PaginationParams {
  page: number;
  size: number;
  sort?: SortDocumentsEnum;
  status?: DocumentStatus;
  creatorId?: string;
  creatorEmail?: string;
}
