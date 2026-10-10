import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { Department } from '../../../models/department.interface';
import { DepartmentApiResponse } from '../../../models/department-api-response.interface';
import { BehaviorSubject, catchError, concatMap, of, switchMap } from 'rxjs';
import { DepartmentService } from '../../../services/department.service';
import { MatDialog } from '@angular/material/dialog';
import { DepartmentForm } from '../department-form/department-form';
import { DepartmentView } from '../department-view/department-view';
import { MatIcon } from '@angular/material/icon';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HasRoleDirective } from '../../../directives';
import { ConfirmationDialog } from '../../common/confirmation-dialog/confirmation-dialog';
import { NotificationService } from '../../../services/notification.service';
import { PrimaryButton } from '../../common/primary-button/primary-button';
import { ResponsiveTable } from '../../common/responsive-table/responsive-table';
import { TableToolbar } from '../../common/table-toolbar/table-toolbar';

@Component({
  selector: 'app-department-table',
  imports: [
    MatCardModule,
    MatTableModule,
    MatIcon,
    MatPaginator,
    MatSortModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    HasRoleDirective,
    PrimaryButton,
    ResponsiveTable,
    TableToolbar
  ],
  templateUrl: './department-table.html',
  styleUrl: './department-table.scss',
})
export class DepartmentTable implements AfterViewInit {

  displayedColumns = ['name', 'headcount', 'manager', 'action'];
  private notify = inject(NotificationService);

  private refreshTrigger$ = new BehaviorSubject<void>(undefined);
  private confirmationDialog = inject(MatDialog);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<Department>([]);

  constructor(
    private departmentService: DepartmentService,
    private departmentFormDialog: MatDialog,
    private departmentViewDialog: MatDialog
  ) {}

  ngOnInit(): void {

    this.refreshTrigger$.pipe(
      switchMap(() => this.departmentService.getDepartments()),
      catchError(() => {
        return of({data: []} as DepartmentApiResponse);
      })
    ).subscribe(departments => {
      this.dataSource.data = departments.data;
      this.initialSort();
    });

  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort; 

    this.dataSource.sortingDataAccessor = (item: Department, property: string) => {
      switch (property) {
        case 'name':
          return item.name.toLowerCase();
        case 'headcount':
          return item.stats?.headcount ?? 0;
        case 'manager':
          return item.manager?.fullName ?? '';
        default:
          return '';
      }
    };

    this.dataSource.filterPredicate = (data: Department, filter: string) => {
      const search = filter.trim().toLowerCase();
      return (
        data.name.toLowerCase().includes(search) ||
        (data.manager?.fullName?.toLowerCase().includes(search) ?? false)
      );
    };
    
  }

  initialSort(){
    if (!this.sort) {
      return;
    }

    this.sort.active = 'name';
    this.sort.direction = 'asc';
    this.sort.sortChange.emit({ active: 'name', direction: 'asc' });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  editDepartment(department?: Department): void {
    const dialogRef = this.departmentFormDialog.open(DepartmentForm, {
      disableClose: true,
      data: department ?? null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshTrigger$.next();
        const action = department ? 'updated' : 'created';
        this.notify.showSuccess(`Department ${action} successfully!`);
      }
    });
  }

  deleteDepartment(department: Department): void {
    const dialogRef = this.confirmationDialog.open(ConfirmationDialog, {
      width: '400px',
      disableClose: true, // Prevents closing by clicking backdrop or pressing Esc
      data: {
        title: 'Delete department?',
        message: `Are you sure you want to delete the department "${department.name}"?`,
        confirmText: 'Yes, Delete',
        cancelText: 'No, Keep It'
      }
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.departmentService.deleteDepartment(department.id).pipe(
          concatMap(() => this.departmentService.getDepartments()),
          catchError(() => {
            this.notify.showError('Failed to delete department');
            return of({data: []} as DepartmentApiResponse);
          })
        ).subscribe(departments => {
          if(departments) {
            this.dataSource.data = departments.data;
            this.notify.showSuccess('Department deleted successfully!');
          }
        });
      } 
    });


  }

  viewDepartment(department: Department): void {
    this.departmentViewDialog.open(DepartmentView, {
      data: department ?? null
    });
  }
}