import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { PrimaryButton } from '../primary-button/primary-button';

@Component({
  selector: 'app-password-update',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatCardModule, 
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, PrimaryButton
  ],
  templateUrl: './password-update-component.html',
  styleUrls: ['./password-update-component.scss']
})
export class PasswordUpdateComponent {
  @Input() currentPasswordTitle: string = 'Current password';
  @Input() submitButtonLabel: string = 'Update password';

  passwordForm: FormGroup;
  hideCurrent = true;
  hideNew = true;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notify: NotificationService
  ) {
    this.passwordForm = this.fb.group({
      current_password: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  // Custom Validator: Ensure New Password and Confirm match
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirm = control.get('password_confirmation');
    return password && confirm && password.value !== confirm.value ? { passwordMismatch: true } : null;
  }

  onSubmit() {
    if (this.passwordForm.valid) {
      this.isLoading = true;
      this.authService.changePassword(this.passwordForm.value).subscribe({
        next: (response) => {
          // Update the local user state so the Guard lets them through
          this.authService.currentUser.update(() => response.user);
          this.authService.passwordHasChanged.set(true);
          this.notify.showSuccess('Password updated successfully.');
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 3000);
        },
        error: (err) => {
          this.isLoading = false;
          // Handle "Incorrect Current Password" from Laravel
          if (err.status === 422) {
             this.passwordForm.get('current_password')?.setErrors({ incorrect: true });
          }
          this.notify.showError('Failed to update password. Please try again.');
        }
      });
    }
  }
}