import { Component, inject, ViewChild, ChangeDetectorRef } from '@angular/core';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { ReportService } from '../../../services/report.service';

@Component({
  selector: 'app-department-headcounts-report',
  imports: [BaseChartDirective],
  templateUrl: './department-headcounts-report.html',
  styleUrls: ['./department-headcounts-report.scss'],
  providers: [provideCharts(withDefaultRegisterables())],
})
export class DepartmentHeadcountsReport {
  reportService = inject(ReportService);
  private cdr = inject(ChangeDetectorRef);

  public barChartType: ChartType = 'bar';

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true }
    },
    scales: {
      y: { beginAtZero: true, grid: { display: false } },
      x: { grid: { display: false } }
    }
  };

  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ 
      data: [], 
      backgroundColor: '#3f51b5', 
      borderRadius: 4 
    }]
  };

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  private pendingUpdate = false;

  ngOnInit() {
    this.reportService.employeeByDepartmentReport().subscribe(data => {
      this.barChartData = {
        labels: data.map(item => item.name),
        datasets: [
          { 
            data: data.map(item => item.count),
            label: 'Employees',
            backgroundColor: '#3f51b5',
            hoverBackgroundColor: '#303f9f'
          }
        ]
      };
      // Ensure the chart updates once data arrives. If the view child
      // isn't available yet, mark a pending update for AfterViewInit.
      this.cdr.detectChanges();
      if (this.chart) {
        this.chart.update();
      } else {
        this.pendingUpdate = true;
      }
    });
  }
  ngAfterViewInit(): void {
    if (this.pendingUpdate) {
      this.cdr.detectChanges();
      this.chart?.update();
      this.pendingUpdate = false;
    }
  }
}
