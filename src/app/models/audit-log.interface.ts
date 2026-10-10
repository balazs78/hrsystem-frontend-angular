export interface AuditLogUser {
  id: number;
  name: string;
}

import { JsonValue } from './json-value.type';

export interface AuditLogEmployee {
  id: number;
  name: string;
}

export interface AuditLog {
  id: number;
  action: string;
  old_value: JsonValue;
  new_value: JsonValue;
  created_at: string;
  user?: AuditLogUser;
  employee?: AuditLogEmployee;
}
