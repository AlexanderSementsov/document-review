import { UserRole } from '../../enums/user-role.enum';

export interface UserResDto {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}
