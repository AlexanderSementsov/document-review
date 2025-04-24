import { DocumentStatus } from '../../enums/document-status.enum';

export interface UploadDocumentDto {
  status: DocumentStatus;
  file: File;
  name: string;
}
