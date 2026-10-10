import { AfterViewInit, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild, inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { EmployeeDatasource } from '../../../services/employee-datasource';
import { EmployeeService } from '../../../services/employee.service';
import { Employee } from '../../../models/employee.interface';
import { tap } from 'rxjs/internal/operators/tap';
import { AsyncPipe } from '@angular/common';
import { auditTime, debounceTime, fromEvent, merge, forkJoin } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { HasRoleDirective } from '../../../directives';
import { AuthService } from '../../../services/auth.service';
import { PositionService } from '../../../services/position.service';
import { DepartmentService } from '../../../services/department.service';
import { Position } from '../../../models/position.interface';
import { Department } from '../../../models/department.interface';
import { PositionApiResponse } from '../../../models/position-api-response.interface';
import { DepartmentApiResponse } from '../../../models/department-api-response.interface';
import { EmployeeBasic } from '../../../models/employee-basic.interface';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MultiSelectFilter } from '../../common/multi-select-filter/multi-select-filter';
import { MultiselectLabelPipe } from '../../../pipes/multiselect-label-pipe';
import { EMPLOYEE_STATUSES } from '../../../models/employee-status.interface';
import { PrimaryButton } from '../../common/primary-button/primary-button';
import { ResponsiveTable } from '../../common/responsive-table/responsive-table';
import { TableToolbar } from '../../common/table-toolbar/table-toolbar';
import { ReplaceUnderscorePipe } from '../../../pipes/replace-underscore-pipe';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-employee-table',
  imports: [
    MatTableModule, 
    MatCardModule, 
    MatIcon, 
    MatPaginatorModule, 
    AsyncPipe, 
    MatButtonModule,
    MatSortModule,
    HasRoleDirective,
    PrimaryButton,
    ResponsiveTable,
    TableToolbar,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MultiSelectFilter,
    MultiselectLabelPipe,
    ReplaceUnderscorePipe,
    TitleCasePipe
  ],
  templateUrl: './employee-table.html',
  styleUrl: './employee-table.scss',
})
export class EmployeeTable implements OnInit, AfterViewInit{
  displayedColumns = ['Avatar', 'Name', 'Position', 'Department', 'Manager', 'Status', 'Actions'];
  statuses = [...EMPLOYEE_STATUSES];
  positionText = (position: Position) => position.title;
  departmentText = (department: Department) => department.name;
  managerText = (manager: EmployeeBasic) => manager.fullName ?? '';
  statusText = (status: string) => status.replaceAll('_', ' ').replace(/\b\w/g, character => character.toUpperCase());
  employeeDataSource: EmployeeDatasource;
  @Output() editEmployeeClicked = new EventEmitter<Employee>();
  @Output() viewEmployeeClicked = new EventEmitter<Employee>();
  @Output() deleteEmployeeClicked = new EventEmitter<Employee>();
  @Output() createEmployeeClicked = new EventEmitter<void>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  @ViewChild('searchInput', { read: ElementRef }) searchInput!: ElementRef; 
  authService = inject(AuthService);

  positions: Position[] = [];
  departments: Department[] = [];
  managers: EmployeeBasic[] = [];
  
  positionControl = new FormControl<number[]>([]);
  departmentControl = new FormControl<number[]>([]);
  managerControl = new FormControl<number[]>([]);
  statusControl = new FormControl<string[]>([]);

  constructor(private employeeService: EmployeeService, private positionService: PositionService, private departmentService: DepartmentService) {
    this.employeeDataSource = new EmployeeDatasource(this.employeeService);
  }

  ngOnInit() {
    forkJoin({
      positions: this.positionService.getPositions(),
      departments: this.departmentService.getDepartments(),
      managers: this.employeeService.getManagers() 
    }).subscribe(({positions, departments, managers}: {positions: PositionApiResponse, departments: DepartmentApiResponse, managers: EmployeeBasic[]

    }) => {
      this.positions = positions.data;
      this.departments = departments.data;
      this.managers = managers;
      this.positionControl.setValue(positions.data.map(p => p.id));
      this.departmentControl.setValue(departments.data.map(d => d.id));
      this.managerControl.setValue(managers?.map((e: EmployeeBasic) => e.id));
      this.statusControl.setValue(this.statuses);

      this.loadEmployees();
    });
  }

  ngAfterViewInit(): void {
     const search$ = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
        debounceTime(300),
        tap(() => this.paginator.pageIndex = 0)
      );
      this.sort.disableClear = true;
      if (!this.sort.active || !this.sort.direction) {
        this.sort.active = 'fullName';
        this.sort.direction = 'asc';
      }
      this.sort.sortChange.emit({ active: this.sort.active, direction: this.sort.direction });

      this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
      this.positionControl.valueChanges.subscribe(() => this.paginator.pageIndex = 0);
      this.departmentControl.valueChanges.subscribe(() => this.paginator.pageIndex = 0);
      this.managerControl.valueChanges.subscribe(() => this.paginator.pageIndex = 0);
      this.statusControl.valueChanges.subscribe(() => this.paginator.pageIndex = 0);
      merge(this.paginator.page, search$, this.sort.sortChange, this.positionControl.valueChanges, this.departmentControl.valueChanges, this.managerControl.valueChanges, this.statusControl.valueChanges)
        .pipe(
          auditTime(0),
          tap(() => this.loadEmployees())
        )
        .subscribe();   
 
  }

  refresh() {
    const pageSize = this.paginator?.pageSize || 10;
    const searchValue = this.searchInput?.nativeElement?.value || '';

    if (this.sort && (!this.sort.active || !this.sort.direction)) {
      this.sort.active = 'fullName';
      this.sort.direction = 'asc';
    }

    const sortActive = this.sort?.active || 'fullName';
    const sortDirection = this.sort?.direction || 'asc';
    const pageIndex = this.paginator?.pageIndex || 0;
    const filters = {
      positions: this.positionControl.value?.length === this.positions.length ? [] : this.positionControl.value || [],
      departments: this.departmentControl.value?.length === this.departments.length ? [] : this.departmentControl.value || [],
      managers: this.managerControl.value?.length === this.managers.length ? [] : this.managerControl.value || [],
      statuses: this.statusControl.value?.length === this.statuses.length ? [] : this.statusControl.value || []
    };

    this.employeeDataSource.loadEmployees(searchValue, sortActive, sortDirection, pageIndex, pageSize, filters);
  }

  loadEmployees() {
    this.refresh();
  }

  editEmployee(employee: Employee) {
    this.editEmployeeClicked.emit(employee);
  }

  viewEmployee(employee: Employee) {
    this.viewEmployeeClicked.emit(employee);
  }

  deleteEmployee(employee: Employee) {
    this.deleteEmployeeClicked.emit(employee);
  }

  createEmployee() {
    this.createEmployeeClicked.emit();
  }

  showViewButton(employee: Employee) {
    if(['Admin', 'HR Manager', 'Auditor'].includes(this.authService.role()))
    {
      return true;
    }
    if(employee.manager?.id === this.authService.currentUser()?.employee_id) {
      return true;
    }
    return false;
  }
}
