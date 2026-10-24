import { Department } from './department.interface';
import { AuditRecord } from './audit-record.interface';
import { Position } from './position.interface';
import { EmployeeBasic } from './employee-basic.interface';
import { EmployeeStatus } from './employee-status.interface';
import { Gender } from './gender.interface';

export interface Employee {
  id: number;
  avatarUrl: string;
  fullName: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  birthdate: string;
  email: string;
  address: string;
  history: Array<AuditRecord>
  phone: string;
  status: EmployeeStatus;
  department: Department;
  position: Position;
  hiredAt: string;
  profileImage: string;
  contractEndDate: string;
  manager: EmployeeBasic | null;
  updatedAt: string;
}