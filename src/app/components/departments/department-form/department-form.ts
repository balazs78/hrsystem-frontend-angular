import { Component, HostListener, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { EmployeeBasic } from '../../../models/employee-basic.interface';
import { DepartmentService } from '../../../services/department.service';
import { Department } from '../../../models/department.interface';
import { EmployeeAutocomplete } from '../../common/employee-autocomplete/employee-autocomplete';
import { FormPersistenceService } from '../../../services/form-persistence.service';
import { PrimaryButton } from '../../common/primary-button/primary-button';

@Component({
  selector: 'app-department-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatAutocompleteModule,
    EmployeeAutocomplete,
    PrimaryButton
  ],
  templateUrl: './department-form.html',
  styleUrls: ['./department-form.scss']
})
export class DepartmentForm implements OnInit, OnDestroy {
  departmentForm: FormGroup;
  private readonly STORAGE_KEY = 'draft_department_form';

  filteredManagers$!: Observable<EmployeeBasic[]>;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DepartmentForm>,
    private departmentService: DepartmentService,
    private formPersistenceService: FormPersistenceService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: Department // Used if we are in "Edit Mode"
  ) {
    // 1. Define Form with Strict Validation
    this.departmentForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      // Regex: 2 Uppercase letters, hyphen, 4 numbers (Matches backend)
      costCenterCode: ['', [
        Validators.required, 
        Validators.pattern(/^[A-Z]{2}-\d{4}$/)
      ]],
      manager: [null] // Optional
    });
  }

  ngOnInit(): void {
    this.formPersistenceService.restore(this.STORAGE_KEY, this.departmentForm);
    if (this.data) {
      const depDataObject = Object.assign(this.data, { manager: this.data.manager ? this.data.manager : null });
      this.departmentForm.patchValue(depDataObject);
    }
  }

  @HostListener('window:beforeunload')
  ngOnDestroy() {
    // Only save if the form hasn't been submitted and is actually edited
    if (this.departmentForm.dirty) {
      this.formPersistenceService.save(this.STORAGE_KEY, this.departmentForm);
    }
  }

  // Helper to force Uppercase on Cost Center
  forceUppercase(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase();
    this.departmentForm.get('costCenterCode')?.setValue(input.value);
  }


  saveDepartment(): void {
    if (this.departmentForm.valid) {
      // Return the Raw Value
      this.departmentService.saveDepartment(this.departmentForm.getRawValue(), this.data?.id).subscribe({
        next: () => {
          this.dialogRef.close(this.departmentForm.getRawValue());
          this.formPersistenceService.clear(this.STORAGE_KEY);
          this.departmentForm.markAsPristine();
        },
        error: (err) => {
          const message = err.error?.message || 'Failed to save department';
          this.snackBar.open(message, 'Error', { duration: 5000, panelClass: ['toast-error'] });
        }
      });
      
    } else {
      // Trigger error display
      this.departmentForm.markAllAsTouched();
    }
  }
}