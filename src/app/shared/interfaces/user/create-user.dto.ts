import { UserRole } from '../../enums/user-role.enum';

export interface CreateUserDto {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
}
