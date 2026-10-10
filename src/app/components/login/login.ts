import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';
import { PrimaryButton } from '../common/primary-button/primary-button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatCardModule, 
    MatFormFieldModule, MatInputModule, MatButtonModule, 
    MatIconModule, MatProgressBarModule, MatCheckboxModule, PrimaryButton
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  
  loginForm: FormGroup;
  hidePassword = signal(true); // Toggle for password visibility
  errorMessage = signal<string | null>(null);
  isLoading = this.authService.isLoading;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      remember: [false]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.errorMessage.set(null);
    
    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        // Assuming the response contains user data
        this.authService.currentUser.set(response);
        
        this.authService.isAuthenticated.set(true);
        this.authService.isLoading.set(false);
        this.router.navigate(['dashboard']);
      },
      error: (err) => {
        // Handle Laravel validation errors or 401 Unauthorized
        this.errorMessage.set(err.error?.message || 'Invalid email or password');
        this.authService.isLoading.set(false);
      }
    });
  }

  onForgotPassword(event: Event) {
    event.preventDefault();
    if(this.loginForm.get('email')?.invalid) {
      this.errorMessage.set('Please enter a valid email address.');
      return;
    }
    else{
      this.authService.forgotPassword(this.loginForm.value.email).subscribe({
        next: () => {
          this.notificationService.showSuccess('Password reset link sent to your email.');
        },
        error: (err) => {
          this.notificationService.showError(err.error?.message || 'Failed to send password reset link.');
        }
      });
    }
  }
}