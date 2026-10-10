import { Component } from '@angular/core';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { SummaryReport } from '../../models/report-data.interface';
import { MatTableModule } from '@angular/material/table';
import { KpiCard } from './kpi-card/kpi-card';
import { ExpiringContractsTable } from './expiring-contracts-table/expiring-contracts-table';
import { OnboardingEmployeesTable } from './onboarding-employees-table/onboarding-employees-table';
import { EmploymentTypeChart } from './employee-type-chart/employment-type-chart';
import { ManagerVsEmployeeChart } from './manager-vs-employee-chart/manager-vs-employee-chart';
import { ReportService } from '../../services/report.service';
import { catchError, Observable, of } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [
    AsyncPipe,
    MatCardModule,
    MatGridListModule,
    MatTableModule,
    KpiCard,
    ExpiringContractsTable,
    OnboardingEmployeesTable,
    EmploymentTypeChart,
    ManagerVsEmployeeChart,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  providers: [provideCharts(withDefaultRegisterables())],
})
export class Dashboard {
  constructor(
    private reportService: ReportService,
    private breakpointObserver: BreakpointObserver
  ) { }

  kpiCols = 4;
  dataCols = 2;
  error = '';
  rowHeight = '300px';
  reportData$!: Observable<SummaryReport | null> | undefined;
  
  ngOnInit() {
    this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]).subscribe(result => {
      const isMobile = result.matches;
      this.kpiCols = isMobile ? 1 : 4;
      this.dataCols = isMobile ? 1 : 2;
    });

    this.reportData$ = this.reportService.summaryReport().pipe(
      // Handle errors within the stream so the UI doesn't break
      catchError(() => {
        this.error = 'Unable to load dashboard data. Please try again.';
        return of(null); // Return null so the stream completes gracefully
      })
    );
  }

  
  displayedColumnsOnboardingEmployees = ['fullName'];

}
