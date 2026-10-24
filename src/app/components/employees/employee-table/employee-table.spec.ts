import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { EmployeeTable } from './employee-table';
import { environment } from '../../../../environments/environment';
import { Employee } from '../../../models/employee.interface';

describe('EmployeeTable', () => {
  let component: EmployeeTable;
  let fixture: ComponentFixture<EmployeeTable>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeTable],
      providers: [provideHttpClientTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeTable);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    fixture.detectChanges();

    const positionsReq = httpMock.expectOne(`${environment.apiUrl}/positions`);
    expect(positionsReq.request.method).toBe('GET');
    positionsReq.flush({ data: [] });

    const departmentsReq = httpMock.expectOne(`${environment.apiUrl}/departments`);
    expect(departmentsReq.request.method).toBe('GET');
    departmentsReq.flush({ data: [] });

    const managersReq = httpMock.expectOne(`${environment.apiUrl}/employees/managers`);
    expect(managersReq.request.method).toBe('GET');
    managersReq.flush([]);

    const employeesReq = httpMock.expectOne(req => req.url.includes(`${environment.apiUrl}/employees`));
    expect(employeesReq.request.method).toBe('GET');
    employeesReq.flush({ data: [], meta: { total: 0 } });

    await fixture.whenStable();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to asc sorting by full name and disable the clear state', () => {
    const table = fixture.nativeElement.querySelector('table');

    expect(table.getAttribute('matSortActive')).toBe('fullName');
    expect(table.getAttribute('matSortDirection')).toBe('asc');
    expect(table.getAttribute('matSortDisableClear')).not.toBeNull();
  });

  it('should show the ascending arrow on the Name header immediately', () => {
    const nameHeader = fixture.nativeElement.querySelector('th[mat-sort-header="fullName"]');

    expect(nameHeader).toBeTruthy();
    expect(nameHeader.getAttribute('aria-sort')).toBe('ascending');
  });

  it('should not throw when a department has no manager', () => {
    component.authService.role.set('Manager');
    component.authService.currentUser.set({
      id: 1,
      name: 'Test Manager',
      email: 'manager@example.com',
      email_verified_at: '',
      password_changed_at: '',
      role: 'Manager',
      employee_id: 10,
      created_at: '',
      updated_at: ''
    });
    const employee = { department: { manager: null } } as unknown as Employee;

    expect(component.showViewButton(employee)).toBe(false);
  });
});
