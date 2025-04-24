import { DocumentResDto } from './document-res.dto';

export interface DocumentsResDto {
  results: DocumentResDto[];
  count: number;
}
