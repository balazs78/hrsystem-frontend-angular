import { DataSource } from '@angular/cdk/table';
import { Injectable } from '@angular/core';
import { Employee } from '../models/employee.interface';
import { CollectionViewer } from '@angular/cdk/collections';
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs';
import { EmployeeService } from './employee.service';
import { EmployeeApiResponse } from '../models/employee-api-response.interface';

@Injectable({
  providedIn: 'root',
})
export class EmployeeDatasource implements DataSource<Employee> {
  private employeeSubject = new BehaviorSubject<EmployeeApiResponse>({data: [], meta: { total: 0 }  });

  constructor(private employeeService: EmployeeService) {}

  loadEmployees(        
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
    this.employeeService.getEmployees(filter, sortColumn, sortDirection, pageIndex+1, pageSize, filters)
      .pipe(
        catchError(() => of({data: [], meta: { total: 0 }}))
      )
      .subscribe(employees => this.employeeSubject.next(employees));
  }

  get totalEmployees(): Observable<number> {
    return this.employeeSubject.asObservable().pipe(map(data => data?.meta.total || 0));
  }

  connect(collectionViewer: CollectionViewer): Observable<Employee[]> {
    return this.employeeSubject.asObservable().pipe(map(employees => employees.data));
  }
  disconnect() {

  }
  
}
