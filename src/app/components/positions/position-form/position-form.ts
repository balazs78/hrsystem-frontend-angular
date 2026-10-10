import { Component, HostListener, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PositionService } from '../../../services/position.service';
import { Position } from '../../../models/position.interface';
import { FormPersistenceService } from '../../../services/form-persistence.service';
import { PrimaryButton } from '../../common/primary-button/primary-button';

@Component({
  selector: 'app-position-form',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDialogModule,
    ReactiveFormsModule,
    PrimaryButton,
  ],
  templateUrl: './position-form.html',
  styleUrl: './position-form.scss',
})
export class PositionForm implements OnInit, OnDestroy {
  positionsForm: FormGroup;
  private readonly STORAGE_KEY = 'draft_position_form';
  constructor(
    private fb: FormBuilder,
    private formDialogRef: MatDialogRef<PositionForm>,
    private positionService: PositionService,
    private persistenceService: FormPersistenceService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: Position // Used if we are in "Edit Mode"
  ) {
    // 1. Define Form with Strict Validation
    this.positionsForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      // Regex: 2 Uppercase letters, hyphen, 4 numbers (Matches backend)
      salaryGrade: ['', [Validators.required ]],
      description: [null] // Optional
    });
  }

  ngOnInit(): void {
    this.persistenceService.restore(this.STORAGE_KEY, this.positionsForm);
    // If we have data (Edit Mode), patch the form with existing values
    if (this.data) {
      this.positionsForm.patchValue(this.data);
    }
  }

    @HostListener('window:beforeunload')
    ngOnDestroy() {
      // Only save if the form hasn't been submitted and is actually edited
      if (this.positionsForm.dirty) {
        this.persistenceService.save(this.STORAGE_KEY, this.positionsForm);
      }
    }

  savePosition(): void {
    if (this.positionsForm.valid) {
      // Return the Raw Value
      this.positionService.savePosition(this.positionsForm.getRawValue(), this.data?.id).subscribe({
        next: () => {
          this.persistenceService.clear(this.STORAGE_KEY);
          this.positionsForm.markAsPristine();
          this.formDialogRef.close(this.positionsForm.getRawValue());
        },
        error: (err) => {
          const message = err.error?.message || 'Failed to save position';
          this.snackBar.open(message, 'Error', { duration: 5000, panelClass: ['toast-error'] });
        }
      });
      
    } else {
      // Trigger error display
      this.positionsForm.markAllAsTouched();
    }
  }
}
