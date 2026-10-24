export interface UserWriteData {
  name: string;
  email: string;
  role: string;
  employee_id?: number | null;
  password?: string;
  password_confirmation?: string;
}

export interface PasswordChangeData {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface PasswordChangeResponse {
  user: import('./user.interface').User;
  token?: string;
}