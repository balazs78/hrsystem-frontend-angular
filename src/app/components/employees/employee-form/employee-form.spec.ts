import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { EmployeeForm } from './employee-form';
import { environment } from '../../../../environments/environment';

describe('EmployeeForm', () => {
  let component: EmployeeForm;
  let fixture: ComponentFixture<EmployeeForm>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeForm],
      providers: [provideHttpClientTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeForm);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    fixture.detectChanges();

    const departmentsReq = httpMock.expectOne(`${environment.apiUrl}/departments`);
    expect(departmentsReq.request.method).toBe('GET');
    departmentsReq.flush({ data: [] });

    const positionsReq = httpMock.expectOne(`${environment.apiUrl}/positions`);
    expect(positionsReq.request.method).toBe('GET');
    positionsReq.flush({ data: [] });

    await fixture.whenStable();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should only format actual date fields as dates when building form data', () => {
    component.employeeForm.patchValue({
      departmentId: '032',
      positionId: '032',
      birthdate: new Date('2032-01-01T00:00:00.000Z'),
      hiredAt: new Date('2024-03-04T00:00:00.000Z')
    });

    const buildFormData = (component as unknown as {
      buildFormData(value: Record<string, unknown>): FormData;
    }).buildFormData.bind(component);
    const formData = buildFormData(component.employeeForm.getRawValue());

    expect(formData.get('departmentId')).toBe('032');
    expect(formData.get('positionId')).toBe('032');
    expect(formData.get('birthdate')).toBe('2032-01-01T00:00:00+00:00');
    expect(formData.get('hiredAt')).toBe('2024-03-04T00:00:00+00:00');
  });
});
