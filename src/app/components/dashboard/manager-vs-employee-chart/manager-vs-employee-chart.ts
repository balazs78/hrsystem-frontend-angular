import { Component, Input } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';


@Component({
  selector: 'app-manager-vs-employee-chart',
  imports: [BaseChartDirective],
  templateUrl: './manager-vs-employee-chart.html',
  styleUrl: './manager-vs-employee-chart.scss',
})
export class ManagerVsEmployeeChart {
  // Input received from the Dashboard Parent (fetching from Laravel API)
  @Input() managerCount: number = 0;
  @Input() individualContributorCount: number = 0;

  public pieChartType: ChartType = 'pie';

  // Define the Chart Data structure
  public pieChartData: ChartData<'pie'> = {
    labels: ['Managers', 'Individual contributors'],
    datasets: [{
      data: [0, 0],
      backgroundColor: ['#3f51b5', '#ff4081'], // Use Angular Material Primary/Accent colors
      hoverBackgroundColor: ['#303f9f', '#f50057'],
      borderWidth: 1
    }]
  };

  // Professional configuration
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { font: { family: 'Roboto, "Helvetica Neue", sans-serif' } }
      },
      tooltip: {
        callbacks: {
          label: (item) => ` ${item.label}: ${item.raw} users`
        }
      }
    }
  };

  ngOnInit() {
    // Update chart data once inputs are received
    this.pieChartData.datasets[0].data = [this.managerCount, this.individualContributorCount];
  }
}
