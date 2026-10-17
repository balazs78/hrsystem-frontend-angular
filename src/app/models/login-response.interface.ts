import { User } from './user.interface';

export interface LoginResponse {
  token: string;
  token_type: 'Bearer';
  user: User;
}
