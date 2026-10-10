import { Component, Input, OnInit } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-employment-type-chart',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './employment-type-chart.html',
  styleUrl: './employment-type-chart.scss'
})
export class EmploymentTypeChart implements OnInit {
  // Input received from the Dashboard Parent (fetching from Laravel API)
  @Input() employeeCount: number = 0;
  @Input() contractorCount: number = 0;

  public pieChartType: ChartType = 'pie';

  // Define the Chart Data structure
  public pieChartData: ChartData<'pie'> = {
    labels: ['Full-time Employees', 'Contractors'],
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
    this.pieChartData.datasets[0].data = [this.employeeCount, this.contractorCount];
  }
}