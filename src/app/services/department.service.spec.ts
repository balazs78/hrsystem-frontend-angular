import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { DepartmentService } from './department.service';
import { environment } from '../../environments/environment';
import { DepartmentApiResponse } from '../models/department-api-response.interface';

describe('DepartmentService', () => {
  let service: DepartmentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()]
    });
    service = TestBed.inject(DepartmentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch departments', () => {
    const mockResponse: DepartmentApiResponse = { data: [] };

    service.getDepartments().subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/departments`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});
