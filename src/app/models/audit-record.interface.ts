

export interface AuditRecord {
  id: number;
  userId: number;
  employeeId: number;
  action: string;
  oldValue: string;
  newValue: string;
  createdAt: string;
  updatedAt: string;
}