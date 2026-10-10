import { AfterViewInit, Component, ViewChild, inject } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { BehaviorSubject, catchError, concatMap, of, switchMap } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { UserForm } from '../user-form/user-form';
import { MatIcon } from '@angular/material/icon';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ConfirmationDialog } from '../../common/confirmation-dialog/confirmation-dialog';
import { NotificationService } from '../../../services/notification.service';
import { PrimaryButton } from '../../common/primary-button/primary-button';
import { ResponsiveTable } from '../../common/responsive-table/responsive-table';
import { TableToolbar } from '../../common/table-toolbar/table-toolbar';
import { HasRoleDirective } from '../../../directives';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-user-table',
  imports: [
    MatCardModule,
    MatTableModule,
    MatIcon,
    MatPaginator,
    MatSortModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    PrimaryButton,
    ResponsiveTable,
    TableToolbar,
    HasRoleDirective
  ],
  templateUrl: './user-table.html',
  styleUrl: './user-table.scss',
})
export class UserTable implements AfterViewInit {

  private authService = inject(AuthService);

  get displayedColumns(): string[] {
    const columns = ['name', 'email', 'role'];
    return this.authService.role() === 'Admin' ? [...columns, 'action'] : columns;
  }

  private refreshTrigger$ = new BehaviorSubject<void>(undefined);
  private confirmationDialog = inject(MatDialog); 
  private notify = inject(NotificationService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<User>([]);

  constructor(
    private userService: UserService,
    private userFormDialog: MatDialog
  ) {}

  ngOnInit(): void {

    this.refreshTrigger$.pipe(
      switchMap(() => this.userService.getUsers()),
      catchError(() => {
        return of([]);
      })
    ).subscribe(users => {
      this.dataSource.data = users;
      this.initialSort();
    });

  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.dataSource.sortingDataAccessor = (item: User, property: string) => {
      switch (property) {
        case 'name':
          return item.name.toLowerCase();
        case 'email':
          return item.email.toLowerCase();
        case 'role':
          return item.role.toLowerCase();
        default:
          return '';
      }
    };

    this.dataSource.filterPredicate = (data: User, filter: string) => {
      const search = filter.trim().toLowerCase();
      return (
        data.name.toLowerCase().includes(search) ||
        data.email.toLowerCase().includes(search) ||
        data.role.toLowerCase().includes(search)
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

  editUser(user?: User): void {
    const dialogRef = this.userFormDialog.open(UserForm, {
      data: user ?? null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshTrigger$.next();
        this.notify.showSuccess(`User ${user ? 'updated' : 'created'} successfully!`);
      }
    });
  }

  deleteUser(user: User): void {
    const dialogRef = this.confirmationDialog.open(ConfirmationDialog, {
      width: '400px',
      disableClose: true, // Prevents closing by clicking backdrop or pressing Esc
      data: {
        title: 'Delete user?',
        message: `Are you sure you want to delete the user "${user.name}"?`,
        confirmText: 'Yes, Delete',
        cancelText: 'No, Keep It'
      }
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.userService.deleteUser(user.id).pipe(
          concatMap(() => this.userService.getUsers()),
          catchError(() => {
            this.notify.showError('Failed to delete user');
            return of(null);
          })
        ).subscribe(users => {
          if(users) {
            this.dataSource.data = users;
            this.notify.showSuccess('User deleted successfully!');
          }
        });
      }
    });

  }
}