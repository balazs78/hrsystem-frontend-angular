import { Component } from '@angular/core';

@Component({
  selector: 'app-responsive-table',
  standalone: true,
  template: '<ng-content />',
  styleUrl: './responsive-table.scss'
})
export class ResponsiveTable {}