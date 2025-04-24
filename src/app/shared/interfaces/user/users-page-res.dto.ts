import { UserResDto } from './user-res.dto';

export interface UsersPageResDto {
  results: UserResDto[];
  count: number;
}
