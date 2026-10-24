import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { EmployeeService } from './employee.service';
import { environment } from '../../environments/environment';
import { EmployeeBasic } from '../models/employee-basic.interface';

describe('EmployeeService', () => {
  let service: EmployeeService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()]
    });
    service = TestBed.inject(EmployeeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch managers', () => {
    const mockManagers: EmployeeBasic[] = [{ id: 1, firstName: 'Jane', lastName: 'Doe', fullName: 'Jane Doe' }];

    service.getManagers().subscribe(managers => {
      expect(managers).toEqual(mockManagers);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/employees/managers`);
    expect(req.request.method).toBe('GET');
    req.flush(mockManagers);
  });
});
