import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';
import { EmployeeBasic } from '../models/employee-basic.interface';
import { Employee } from '../models/employee.interface';
import { EmployeeApiResponse } from '../models/employee-api-response.interface';
import { SingleEmployeeApiResponse } from '../models/single-employee-api-response.interface';
import { Department } from '../models/department.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private readonly apiUrl = environment.apiUrl;
  private managerCache$?: Observable<EmployeeBasic[]>;

  constructor(private http: HttpClient) { }
    
  searchEmployees(query: string, allStatuses: boolean): Observable<EmployeeBasic[]> {
     const headers = new HttpHeaders().set('X-Skip-Loader', 'true');
    let link = `${this.apiUrl}/employees/search?query=${query}`;
    if(allStatuses) {
      link += `&allstatuses`;
    }
    return this.http.get<EmployeeBasic[]>(link, { headers });
  }

  getEmployees(
        filter: string,
        sortColumn: string,
        sortDirection: string,
        pageIndex: number,
        pageSize: number,
        filters?: {
          positions?: number[],
          departments?: number[],
          managers?: number[],
          statuses?: string[]
        }
  ) {
    if(sortColumn === 'Name' || sortColumn === 'fullName') {
      sortColumn = 'first_name';
    }
    let params = new HttpParams()
      .set('search', filter)
      .set('sort', sortColumn)
      .set('direction', sortDirection)
      .set('page', pageIndex)
      .set('pageSize', pageSize);

    if (filters?.positions && filters.positions.length > 0) {
      filters.positions.forEach(id => {
        params = params.append('position[]', id.toString());
      });
    }
    if (filters?.departments && filters.departments.length > 0) {
      filters.departments.forEach(id => {
        params = params.append('department[]', id.toString());
      });
    }
    if (filters?.managers && filters.managers.length > 0) {
      filters.managers.forEach(id => {
        params = params.append('manager[]', id.toString());
      });
    }
    if (filters?.statuses && filters.statuses.length > 0) {
      filters.statuses.forEach(status => {
        params = params.append('status[]', status);
      });
    }

    return this.http.get<EmployeeApiResponse>(`${this.apiUrl}/employees`, { params });
  }

  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<SingleEmployeeApiResponse>(`${this.apiUrl}/employees/${id}`).pipe(
      map(res => res['data'])
    );
  }

  getManagers(): Observable<EmployeeBasic[]> {
    if (!this.managerCache$) {
      this.managerCache$ = this.http.get<EmployeeBasic[]>(`${this.apiUrl}/employees/managers`).pipe(shareReplay(1));
    }
    return this.managerCache$;
  }

  saveEmployee(employee: Employee | FormData, employeeId?: number): Observable<Employee> {
    if (employeeId == undefined) {
      return this.createEmployee(employee);
    }
    return this.updateEmployee(employeeId, employee);
  }

  createEmployee(employee: Employee | FormData): Observable<Employee> {
    return this.http.post<Employee>(`${this.apiUrl}/employees`, employee);
  }

  updateEmployee(employeeID: number, employee: Employee | FormData): Observable<Employee> {
    return this.http.post<Employee>(`${this.apiUrl}/employees/${employeeID}`, employee);
  }

  deleteEmployee(employeeID: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/employees/${employeeID}`);
  }
  
}
