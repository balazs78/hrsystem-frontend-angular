import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { ReportService } from './report.service';
import { environment } from '../../environments/environment';
import { SummaryReport } from '../models/report-data.interface';

describe('ReportService', () => {
  let service: ReportService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()]
    });
    service = TestBed.inject(ReportService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch summary report', () => {
    const mockSummary: SummaryReport = {
      summary: [],
      onboardingEmployees: [],
      expiringContracts: [],
      employeeTypeChartData: { employeeCount: 0, contractorCount: 0 },
      managerVsEmployeeChartData: { managerCount: 0, individualContributorCount: 0 }
    };

    service.summaryReport().subscribe(report => {
      expect(report).toEqual(mockSummary);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/reports/summary`);
    expect(req.request.method).toBe('GET');
    req.flush(mockSummary);
  });
});
