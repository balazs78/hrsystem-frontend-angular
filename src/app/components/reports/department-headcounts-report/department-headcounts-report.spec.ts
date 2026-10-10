import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { DepartmentHeadcountsReport } from './department-headcounts-report';
import { environment } from '../../../../environments/environment';

describe('DepartmentHeadcountsReport', () => {
  let component: DepartmentHeadcountsReport;
  let fixture: ComponentFixture<DepartmentHeadcountsReport>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartmentHeadcountsReport],
      providers: [provideHttpClientTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepartmentHeadcountsReport);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    fixture.detectChanges();

    const req = httpMock.expectOne(`${environment.apiUrl}/reports/department-headcounts`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
    await fixture.whenStable();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
