import { TestBed } from '@angular/core/testing';

import { EmployeeDatasource } from './employee-datasource';

describe('EmployeeDatasource', () => {
  let service: EmployeeDatasource;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmployeeDatasource);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
