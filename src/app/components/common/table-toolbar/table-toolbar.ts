import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-table-toolbar',
  standalone: true,
  imports: [MatToolbarModule],
  template: '<mat-toolbar><ng-content /></mat-toolbar>',
  styleUrl: './table-toolbar.scss'
})
export class TableToolbar {}