import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AuditLog } from '../../../models/audit-log.interface';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule, Sort } from '@angular/material/sort';
import { ResponsiveTable } from '../../common/responsive-table/responsive-table';

@Component({
  selector: 'app-audit-log-table',
  standalone: true,
  imports: [
    MatTableModule,
    MatProgressSpinnerModule,
    MatSortModule,
    ResponsiveTable,
  ],
  templateUrl: './audit-log-table.html',
  styleUrls: ['./audit-log-table.scss'],
  providers: [DatePipe]
})
export class AuditLogTable {
  @Input() auditLogs: AuditLog[] = [];
  @Input() loading = false;
  @Output() sortChange = new EventEmitter<Sort>();
  displayedColumns = ['created_at', 'action', 'user', 'employee'];
}
