import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { UserService } from '../../../services/user.service';
import { NotificationService } from '../../../services/notification.service';
import { PrimaryButton } from '../../common/primary-button/primary-button';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, 
    MatInputModule, MatSelectModule, PrimaryButton,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private notify = inject(NotificationService);

  userForm: FormGroup;
  roles = ['admin', 'manager'];

  constructor() {
    this.userForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      role: ['manager', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  // Custom Validator to check if passwords match
  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('password_confirmation')?.value
       ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.userForm.valid) {
      this.userService.register(this.userForm.value)
        .subscribe({
          next: () => {
            this.notify.showSuccess('User Created Successfully');
            this.userForm.reset({ role: 'manager' });
          },
          error: (err) => {
            const message = err.error?.message || 'Email might already be taken';
            this.notify.showError(message);
          }
        });
    }
  }
}
