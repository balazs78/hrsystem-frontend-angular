import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { EmployeePerDepartmentChartData, SummaryReport, YearlyTrendData } from '../models/report-data.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }
  
  summaryReport(): Observable<SummaryReport> {
    return this.http.get<SummaryReport>(`${this.apiUrl}/reports/summary`);
  }

  yearlyTrendReport(): Observable<YearlyTrendData[]> {
    return this.http.get<YearlyTrendData[]>(`${this.apiUrl}/reports/yearly-trend`);
  }

  employeeByDepartmentReport(): Observable<EmployeePerDepartmentChartData[]> {
    return this.http.get<EmployeePerDepartmentChartData[]>(`${this.apiUrl}/reports/department-headcounts`);
  }


}