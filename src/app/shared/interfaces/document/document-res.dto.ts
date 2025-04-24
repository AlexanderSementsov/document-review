import { UserResDto } from '../user/user-res.dto';
import { DocumentStatus } from '../../enums/document-status.enum';

export interface DocumentResDto {
  creator: UserResDto;
  id: string;
  name: string;
  status: DocumentStatus;
  fileUrl: string;
  updatedAt: string;
  createdAt: string;
}
