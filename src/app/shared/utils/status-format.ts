import { DocumentStatus } from '../enums/document-status.enum';

export const formatStatus = (status: DocumentStatus): string => {
  if (!status) return '';
  return status
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
