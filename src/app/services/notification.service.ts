import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  /**
   * Success: Green, Auto-dismiss after 10s
   */
  showSuccess(message: string): void {
    this.open(message, 'Dismiss', {
      duration: 5000,
      panelClass: ['toast-success'],
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  /**
   * Error: Red, No auto-dismiss (Indefinite until user clicks)
   */
  showError(message: string): void {
    this.open(message, 'Close', {
      duration: 0, // 0 means it won't auto-hide
      panelClass: ['toast-error'],
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  private open(message: string, action: string, config: MatSnackBarConfig): void {
    this.snackBar.open(message, action, config);
  }
}