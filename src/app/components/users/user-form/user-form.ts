import { Component, HostListener, Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators, ValidatorFn } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService } from '../../../services/user.service';
import { ROLES } from '../../../models/user.interface';
import { FormPersistenceService } from '../../../services/form-persistence.service';
import { EmployeeService } from '../../../services/employee.service';
import { Subscription } from 'rxjs';
import { User } from '../../../models/user.interface';
import { PrimaryButton } from '../../common/primary-button/primary-button';
/*
interface User {
  id?: number;
  name: string;
  email: string;
  role: string;
  employee_id?: number;
  password?: string;
  password_confirmation?: string;
}*/

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule,
    PrimaryButton
  ],
  templateUrl: './user-form.html',
  styleUrls: ['./user-form.scss']
})
export class UserForm implements OnInit, OnDestroy {
  userForm: FormGroup;
  roles = ROLES;
  managers$: ReturnType<EmployeeService['getManagers']>;
  isEditMode = false;
  private readonly STORAGE_KEY = 'draft_user_form';
  private roleSubscription?: Subscription;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UserForm>,
    private userService: UserService,
    private employeeService: EmployeeService,
    private snackBar: MatSnackBar,
    private persistenceService: FormPersistenceService,
    @Inject(MAT_DIALOG_DATA) public data: User
  ) {
    this.managers$ = this.employeeService.getManagers();
    this.isEditMode = !!data?.id;

    const hasData = !!data;
    this.isEditMode = hasData;

    this.userForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      role: ['Manager', [Validators.required]],
      employee_id: [null]
    });

    this.updateEmployeeValidator('Manager');
    this.roleSubscription = this.userForm.get('role')!.valueChanges.subscribe(role => {
      this.updateEmployeeValidator(role);
    });

    // Add password fields only for new users
    if (!hasData) {
      this.userForm.addControl('password', this.fb.control('', [Validators.required, Validators.minLength(8)]));
      this.userForm.addControl('password_confirmation', this.fb.control('', [Validators.required]));
      this.userForm.setValidators(this.passwordMatchValidator as ValidatorFn);
    }
  }


  ngOnInit(): void {
    this.persistenceService.restore(this.STORAGE_KEY, this.userForm);
    if (this.data) {
      this.userForm.patchValue({
        name: this.data.name,
        email: this.data.email,
        role: this.data.role,
        employee_id: this.data.employee_id
      });
    }
  }

    @HostListener('window:beforeunload')
  ngOnDestroy() {
    this.roleSubscription?.unsubscribe();
    // Only save if the form hasn't been submitted and is actually edited
    if (this.userForm.dirty) {
      this.persistenceService.save(this.STORAGE_KEY, this.userForm, ['password', 'password_confirmation']);
    }
  }

  passwordMatchValidator: ValidatorFn = (control: AbstractControl) => {
    const password = control.get('password')?.value;
    const passwordConfirmation = control.get('password_confirmation')?.value;
    return password === passwordConfirmation ? null : { mismatch: true };
  };

  private updateEmployeeValidator(role: string): void {
    const employeeControl = this.userForm.get('employee_id')!;
    if (role === 'Manager') {
      employeeControl.setValidators(Validators.required);
    } else {
      employeeControl.clearValidators();
      employeeControl.reset(null, { emitEvent: false });
    }
    employeeControl.updateValueAndValidity({ emitEvent: false });
  }

  saveUser(): void {
    if (this.userForm.valid) {
      const { employee_id, ...formData } = this.userForm.getRawValue();
      const userData = this.userForm.get('role')?.value === 'Manager'
        ? { ...formData, employee_id }
        : formData;
      this.persistenceService.clear(this.STORAGE_KEY);
      this.userForm.markAsPristine();

      if (this.isEditMode) {
        // Update existing user
        this.userService.updateUser(this.data.id!, userData).subscribe({
          next: () => {
            this.snackBar.open('User updated successfully', 'Close', { duration: 3000, panelClass: ['toast-success'] });
            this.dialogRef.close(userData);
          },
          error: (err) => {
            const message = err.error?.message || 'Failed to update user';
            this.snackBar.open(message, 'Error', { duration: 5000, panelClass: ['toast-error'] });
          }
        });
      } else {
        // Create new user
        this.userService.register(userData).subscribe({
          next: () => {
            this.snackBar.open('User created successfully', 'Close', { duration: 3000, panelClass: ['toast-success'] });
            this.dialogRef.close(userData);
          },
          error: (err) => {
            const message = err.error?.message || 'Email might already be taken';
            this.snackBar.open(message, 'Error', { duration: 5000, panelClass: ['toast-error'] });
          }
        });
      }
    } else {
      this.userForm.markAllAsTouched();
    }
  }
}