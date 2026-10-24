import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { Department } from '../models/department.interface';
import { map } from 'rxjs/internal/operators/map';
import { DepartmentApiResponse } from '../models/department-api-response.interface';
import { DepartmentDto } from '../models/department.dto';
import { environment } from '../../environments/environment';
import { shareReplay } from 'rxjs/internal/operators/shareReplay';

@Injectable({
  providedIn: 'root',
})
export class DepartmentService {
  private departmentCache$?: Observable<DepartmentApiResponse>;
    constructor(private http: HttpClient) { }

    private invalidateDepartmentCache(): void {
      this.departmentCache$ = undefined;
    }
    
    getDepartments(): Observable<DepartmentApiResponse> {
      if (!this.departmentCache$) {
        this.departmentCache$ = this.http.get<DepartmentApiResponse>
          (`${environment.apiUrl}/departments`).pipe(shareReplay(1));
      }
      return this.departmentCache$;
    }

    saveDepartment(department: Department, departmentID?: number): Observable<Department> {
      if(departmentID == undefined) {
        return this.createDepartment(department);
      }
      return this.updateDepartment(departmentID, department);
    }

    getDepartmentPayload(department: Department): DepartmentDto {
      return {
        name: department.name,
        costCenterCode: department.costCenterCode,
        managerId: department.manager?.id
      };
    }


    createDepartment(department: Department): Observable<Department> {  
      const payload = this.getDepartmentPayload(department);
      return this.http.post<Department>(`${environment.apiUrl}/departments`, payload).pipe(
        map(() => {
          this.invalidateDepartmentCache();
          return department;
        })
      );
    }

    updateDepartment(departmentID: number, department: Department): Observable<Department> {
      const payload = this.getDepartmentPayload(department);
      return this.http.put<Department>(`${environment.apiUrl}/departments/${departmentID}`, payload).pipe(
        map(() => {
          this.invalidateDepartmentCache();
          return department;
        })
      );
    }

    deleteDepartment(departmentID: number): Observable<void> {
      return this.http.delete<void>(`${environment.apiUrl}/departments/${departmentID}`).pipe(
        map(() => {
          this.invalidateDepartmentCache();
        })
      );
    }
}