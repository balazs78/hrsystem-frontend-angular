import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { environment } from '../../../../environments/environment';
import { PrimaryButton } from '../../common/primary-button/primary-button';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    ReactiveFormsModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule, 
    MatIconModule,
    MatSnackBarModule,
    PrimaryButton
  ],
  templateUrl: './reset-password-component.html',
  styleUrls: ['./reset-password-component.scss']
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  private readonly webUrl = environment.webUrl;

  resetForm!: FormGroup;
  hidePassword = true;
  loading = false;

  ngOnInit(): void {
    // 1. Get token and email from URL query parameters
    const token = this.route.snapshot.paramMap.get('token');
    const email = this.route.snapshot.queryParams['email'];

    // 2. Initialize Form
    this.resetForm = this.fb.group({
      token: [token, [Validators.required]],
      email: [email, [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  // Custom Validator to ensure passwords match
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirm = control.get('password_confirmation');
    return password && confirm && password.value !== confirm.value ? { mismatch: true } : null;
  }

  onSubmit(): void {
    if (this.resetForm.invalid) return;

    this.loading = true;
    
    // 3. Send to Laravel Breeze /reset-password
    this.http.post(`${this.webUrl}/reset-password`, this.resetForm.value)
      .subscribe({
        next: () => {
          this.snackBar.open('Password reset successfully! Redirecting to login...', 'Close', { duration: 5000 });
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.loading = false;
          const message = err.error?.message || 'Failed to reset password. The link might be expired.';
          this.snackBar.open(message, 'Close', { duration: 5000 });
        }
      });
  }
}