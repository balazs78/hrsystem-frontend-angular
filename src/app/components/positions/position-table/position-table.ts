import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { concatMap, of, switchMap } from 'rxjs';
import { Position } from '../../../models/position.interface';
import { PositionApiResponse } from '../../../models/position-api-response.interface';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { PositionService } from '../../../services/position.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialog } from '../../common/confirmation-dialog/confirmation-dialog';
import { catchError } from 'rxjs/internal/operators/catchError';
import { PositionForm } from '../position-form/position-form';
import { PositionView } from '../position-view/position-view';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HasRoleDirective } from '../../../directives';
import { NotificationService } from '../../../services/notification.service';
import { PrimaryButton } from '../../common/primary-button/primary-button';
import { ResponsiveTable } from '../../common/responsive-table/responsive-table';
import { TableToolbar } from '../../common/table-toolbar/table-toolbar';

@Component({
  selector: 'app-position-table',
  imports: [
    MatTableModule,
    MatCardModule, 
    MatButtonModule, 
    MatIconModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    HasRoleDirective,
    PrimaryButton,
    ResponsiveTable,
    TableToolbar
  ],
  templateUrl: './position-table.html',
  styleUrl: './position-table.scss',
})
export class PositionTable implements OnInit, AfterViewInit {
  displayedColumns = ['title', 'salaryGrade', 'headcount', 'action'];
  positionList$: Observable<Position[] | null> | undefined;
  private refreshTrigger$ = new BehaviorSubject<void>(undefined);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  dataSource = new MatTableDataSource<Position>([]);
  private confirmationDialog = inject(MatDialog);
  private notify = inject(NotificationService);

  constructor(
    private positionService: PositionService,
    private positionFormDialog: MatDialog,
    private positionViewDialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.refreshTrigger$.pipe(
      switchMap(() =>  this.positionService.getPositions()),
      catchError(() => {
        return of({data: []} as PositionApiResponse);
      })
    ).subscribe(positions => {
      this.dataSource.data = positions.data;
      this.initialSort();
    });
  }

  ngAfterViewInit(): void {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
  
      this.dataSource.sortingDataAccessor = (item: Position, property: string) => {
        switch (property) {
          case 'title':
            return item.title.toLowerCase();
          case 'salaryGrade':
            return item.salaryGrade;
          case 'headcount':
            return item.headcount;
          case 'description':
            return item.description?.toLowerCase();
          default:
            return '';
        }
      };
  
      this.dataSource.filterPredicate = (data: Position, filter: string) => {
        const search = filter.trim().toLowerCase();
        return (
          data.title.toLowerCase().includes(search) ||
          data.salaryGrade.toString().includes(search) ||
          data.headcount.toString().includes(search) ||
          data.description?.toLowerCase().includes(search)
        );
      };

      
    }

    initialSort(){
      if (!this.sort) {
        return;
      }

      this.sort.active = 'title';
      this.sort.direction = 'asc';
      this.sort.sortChange.emit({ active: 'title', direction: 'asc' });
    }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
 
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  editPosition(position?: Position): void {
    // Logic to open the position form in edit mode
    const dialogRef = this.positionFormDialog.open(PositionForm, {
      disableClose: true,
      data: position ?? null // Pass the position data to the form component
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // If the form was submitted successfully, refresh the position list
        this.refreshTrigger$.next();
        this.notify.showSuccess(`Position ${position ? 'updated' : 'created'} successfully!`);
      }
    });
  }

  deletePosition(position: Position): void {

    const dialogRef = this.confirmationDialog.open(ConfirmationDialog, {
      width: '400px',
      disableClose: true, // Prevents closing by clicking backdrop or pressing Esc
      data: {
        title: 'Delete position?',
        message: `Are you sure you want to delete the position "${position.title}"?`,
        confirmText: 'Yes, Delete',
        cancelText: 'No, Keep It'
      }
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.positionService.deletePosition(position.id).pipe(
          concatMap(() => this.positionService.getPositions()),
          catchError(() => {
            this.notify.showError('Failed to delete position');
            return of({data: []} as PositionApiResponse);
          })
        ).subscribe(positions => {
          if(positions) {
            this.dataSource.data = positions.data;
            this.notify.showSuccess('Position deleted successfully!');
          }
        });
      }
    });
  
    }

    viewPosition(position: Position): void {
      this.positionViewDialog.open(PositionView, {
        data: position ?? null 
      });
    }
}
