import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { YearlyTrendReport } from './yearly-trend-report';
import { environment } from '../../../../environments/environment';

describe('YearlyTrendReport', () => {
  let component: YearlyTrendReport;
  let fixture: ComponentFixture<YearlyTrendReport>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YearlyTrendReport],
      providers: [provideHttpClientTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YearlyTrendReport);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    fixture.detectChanges();

    const req = httpMock.expectOne(`${environment.apiUrl}/reports/yearly-trend`);
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
