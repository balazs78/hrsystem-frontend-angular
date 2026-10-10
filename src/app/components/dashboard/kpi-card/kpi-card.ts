import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { SummaryWidget } from '../../../models/report-data.interface';

@Component({
  selector: 'app-kpi-card',
  imports: [
    MatCardModule,
    MatGridListModule,
  ],
  templateUrl: './kpi-card.html',
})
export class KpiCard {
  @Input() statistic!: SummaryWidget;
}