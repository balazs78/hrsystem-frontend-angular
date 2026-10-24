export interface DepartmentDto {
  name: string;
  costCenterCode: string;
  managerId?: number; // Clear intent that this is optional
}