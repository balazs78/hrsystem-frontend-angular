import { Employee } from './employee.interface';


export interface EmployeeApiResponse {
  data: Employee[];
  meta: { total: number };
}