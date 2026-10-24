import { Component, inject, ViewChild } from '@angular/core';
import { MatDrawer, MatDrawerContent, MatDrawerContainer } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EmployeeTable } from '../employee-table/employee-table';
import { EmployeeForm } from '../employee-form/employee-form';
import { EmployeeView } from '../employee-view/employee-view';
import { Employee } from '../../../models/employee.interface';
import { EmployeeService } from '../../../services/employee.service';
import { catchError, of } from 'rxjs';
import { ConfirmationDialog } from '../../common/confirmation-dialog/confirmation-dialog';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-employees',
  imports: [EmployeeTable, EmployeeForm, EmployeeView, MatDrawer, MatDrawerContainer, MatDrawerContent, 
     MatButtonModule, MatDialogModule],
  templateUrl: './employees.html',
  styleUrl: './employees.scss',
})
export class Employees {
  isDrawerOpen: boolean = true;
  drawerContents = 'form';
  private confirmationDialog = inject(MatDialog);
  private notify = inject(NotificationService);
  selectedEmployee: Employee | null = null;
  @ViewChild('drawer') drawer: MatDrawer | undefined;
  @ViewChild(EmployeeForm) employeeFormComponent: EmployeeForm | undefined;
  @ViewChild(EmployeeTable) employeeTable: EmployeeTable | undefined;
  employeeService: EmployeeService = inject(EmployeeService);

  onSaveEmployee(event: FormData) {
    this.employeeService.saveEmployee(event, this.selectedEmployee?.id).subscribe({
      next: () => {
        this.notify.showSuccess(`Employee ${this.selectedEmployee ? 'updated' : 'created'} successfully!`);
        this.selectedEmployee = null;
        this.employeeTable?.refresh();
        this.drawer?.close();
      },
      error: err => this.notify.showError(err.error?.message || 'Failed to save employee')
    });
  }

  saveFormDraft(): void {
    this.employeeFormComponent?.saveDraft();
  }

  restoreFormDraft(): void {
    if (this.drawerContents !== 'form' || this.selectedEmployee) {
      return;
    }

    const restored = this.employeeFormComponent?.restoreDraft() ?? false;
    if (!restored) {
      this.employeeFormComponent?.resetForm();
    }
  }

  openCreate() {
    // Ensure we open the form in "create" mode and clear a selected employee
    this.selectedEmployee = null;
    this.drawerContents = 'form';
    // Reset the child form component even if selectedEmployee was already null
    this.employeeFormComponent?.resetForm();
    this.drawer?.open();
  }

  editEmployee(event: Employee) {
    this.drawerContents = 'form';
    this.employeeService.getEmployeeById(event.id).subscribe(emp => {
      this.selectedEmployee = emp;
      this.drawer?.open();
    });
  }

  viewEmployee(event: Employee) {
    this.selectedEmployee = null;
    this.drawerContents = 'view';
    this.employeeService.getEmployeeById(event.id).subscribe(emp => {
      this.selectedEmployee = emp;
      this.drawer?.open();
    });
  }

  deleteEmployee(event: Employee) {
    const dialogRef = this.confirmationDialog.open(ConfirmationDialog, {
      width: '400px',
      disableClose: true, // Prevents closing by clicking backdrop or pressing Esc
      data: {
        title: 'Delete Permanent Record?',
        message: 'Are you sure you want to delete this record? This action cannot be undone.',
        confirmText: 'Yes, Delete',
        cancelText: 'No, Keep It'
      }
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.employeeService.deleteEmployee(event.id).pipe(
          catchError(err => {
            this.notify.showError(`Failed to delete employee: ${err.message || err}`);
            return of({data: []});
          })
        ).subscribe(() => {
          this.notify.showSuccess('Employee deleted successfully!');
          this.employeeTable?.refresh();
        });
      }
    });
  }

}
