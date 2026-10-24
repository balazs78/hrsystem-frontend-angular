import { Component, inject, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ReportService } from '../../../services/report.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartOptions, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-yearly-trend-report',
  imports: [BaseChartDirective],
  templateUrl: './yearly-trend-report.html',
  styleUrls: ['./yearly-trend-report.scss'],
  providers: [provideCharts(withDefaultRegisterables())],
})
export class YearlyTrendReport implements OnInit{
  reportService = inject(ReportService);
  lineChartType: ChartType = 'line';
  lineChartData: ChartData = { labels: [], datasets: [] };
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  private cdr = inject(ChangeDetectorRef);
  private pendingUpdate = false;
  public lineChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };
  ngOnInit() {
    this.reportService.yearlyTrendReport().subscribe(data => {
      this.lineChartData = {
        labels: data.map(m => m.month_label),
        datasets: [
          {
            data: data.map(m => m.total_headcount),
            label: 'Total Headcount',
            fill: true,
            tension: 0.4, // Smooth curve
            borderColor: '#3f51b5',
            backgroundColor: 'rgba(63, 81, 181, 0.1)'
          }
        ]
      };
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
