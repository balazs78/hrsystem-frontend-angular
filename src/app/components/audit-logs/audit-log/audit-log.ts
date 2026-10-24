import { AfterViewInit, Component, signal, OnInit, ViewChild, inject } from '@angular/core';
import { AuditLog } from '../../../models/audit-log.interface';
import { AuditLogService } from '../../../services/audit-log.service';
import { UserService } from '../../../services/user.service';
import { EmployeeAutocomplete } from '../../common/employee-autocomplete/employee-autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { MatFormField } from '@angular/material/form-field';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { AuditLogTable } from '../audit-log-table/audit-log-table';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { Sort } from '@angular/material/sort';
import { PrimaryButton } from '../../common/primary-button/primary-button';
import { DateRangeField } from '../../common/date-range-field/date-range-field';
import { TableToolbar } from '../../common/table-toolbar/table-toolbar';
import { User } from '../../../models/user.interface';
import { EmployeeBasic } from '../../../models/employee-basic.interface';
import { AuditLogParams } from '../../../services/audit-log.service';

type AuditPeriod = 'today' | 'yesterday' | 'last_7_days' | 'last_30_days' | 'custom';

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [
    MatSelectModule,
    MatFormField,
    MatPaginatorModule,
    EmployeeAutocomplete,
    AuditLogTable,
    PrimaryButton,
    DateRangeField,
    TableToolbar,
    MatCardModule,
  ],
  templateUrl: './audit-log.html',
  styleUrls: ['./audit-log.scss']
})
export class AuditLogComponent implements OnInit, AfterViewInit {
  private auditLogService = inject(AuditLogService);
  private userService = inject(UserService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  period = signal<AuditPeriod>('last_7_days');
  users = signal<User[]>([]);
  selectedUser = signal<number | null>(null);
  selectedEmployee = signal<number | null>(null);
  startDate = signal<string | null>(null);
  endDate = signal<string | null>(null);
  auditLogs = signal<AuditLog[]>([]);
  loading = signal(false);
  sort = signal<'asc' | 'desc' | null>('desc');
  totalLogs = 0;
  pageSize = 10;

  ngOnInit(): void {
    this.loadUsers();
    this.load(1);
  }

  private loadUsers() {
    this.userService.getUsers().subscribe(res => this.users.set(res || []));
  }

  onPeriodChange(value: AuditPeriod) {
    this.period.set(value);
    if (value !== 'custom') {
      this.startDate.set(null);
      this.endDate.set(null);
    }
  }

  onEmployeeSelected(employee: EmployeeBasic | null) {
    this.selectedEmployee.set(employee ? employee.id : null);
  }

  onUserChange(id: number | null) {
    this.selectedUser.set(id ? +id : null);
  }

   onDateRangeStartChange(event: MatDatepickerInputEvent<Date>) {
    if(event.value) this.startDate.set(this.formatDate(event?.value));
  }

  onDateRangeEndChange(event: MatDatepickerInputEvent<Date>) {
    if(event.value) this.endDate.set(this.formatDate(event?.value));
  }

  private formatDate(d: Date) {
    return d.toISOString().slice(0, 10);
  }

  ngAfterViewInit(): void {
    this.paginator.page.subscribe((event: PageEvent) => {
      this.pageSize = event.pageSize;
      this.load(event.pageIndex + 1);
    });
  }

  onGenerate() {
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.load(1);
  }

  onSortChange(event: Sort) {
    this.sort.set(event.direction || null);
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.load(1);
  }

  private buildParams(page: number) {
    const params: AuditLogParams = {
      page,
      pageSize: this.pageSize
    };

    if (this.selectedUser() !== null) params.userId = this.selectedUser();
    if (this.selectedEmployee() !== null) params.employeeId = this.selectedEmployee();
    if (this.sort()) params.sort = this.sort();
    if (this.period() === 'custom') {
      if (this.startDate()) params.startDate = this.startDate();
      if (this.endDate()) params.endDate = this.endDate();
    } else {
      params.period = this.period();
    }

    return params;
  }

  load(page: number = 1) {
    this.loading.set(true);
    const params = this.buildParams(page);

    this.auditLogService.getAuditLogs(params).subscribe({
      next: res => {
        this.auditLogs.set(res.data || []);
        this.totalLogs = res.meta?.total ?? 0;
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
