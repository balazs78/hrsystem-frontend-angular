import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Employee } from '../../../models/employee.interface';
import { Department } from '../../../models/department.interface';
import { DepartmentService } from '../../../services/department.service';
import { PositionService } from '../../../services/position.service';
import { Position } from '../../../models/position.interface';
import { EmployeeAutocomplete } from '../../common/employee-autocomplete/employee-autocomplete';
import { ReplaceUnderscorePipe } from '../../../pipes/replace-underscore-pipe';
import { Gender, GENDERS } from '../../../models/gender.interface';
import { FormPersistenceService } from '../../../services/form-persistence.service';
import { PrimaryButton } from '../../common/primary-button/primary-button';
interface ManagerOption { id: number; name: string; avatar?: string; }

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDatepickerModule, MatNativeDateModule,
    MatButtonModule, MatIconModule, MatAutocompleteModule,
    MatDividerModule, EmployeeAutocomplete, ReplaceUnderscorePipe, PrimaryButton
  ],
  templateUrl: './employee-form.html',
  styleUrls: ['./employee-form.scss']
})
export class EmployeeForm implements OnInit, OnDestroy, AfterViewInit {
  @Output() save = new EventEmitter<FormData>();
  @Output() cancel = new EventEmitter<void>();
  private readonly STORAGE_KEY = 'draft_employee_form';

  private _employeeData: Employee | null = null;
  @Input() set employeeData(value: Employee | null) {
    this._employeeData = value;
    if (value) {
      this.employeeForm.patchValue({
        ...value,
        departmentId: value.department?.id,
        positionId: value.position?.id,
        managerId: value.manager
      });
      this.avatarPreview = value.profileImage || null;
      this.avatarFile = null;
    } else {
      if (!this.restoreDraft()) {
        this.resetForm();
      }
    }
  }
  get employeeData(): Employee | null {
    return this._employeeData;
  }

  employeeForm: FormGroup;
  avatarPreview: string | ArrayBuffer | null = null;
  avatarFile: File | null = null;
  showImageOverlay = false;
  private readonly dateFieldNames = new Set(['birthdate', 'hiredAt', 'contractEndDate']);

  genderOptions: readonly Gender[] = GENDERS;

  // Mock Data Observables (In real app, pass these as @Inputs or fetch from Service)
  departments$: Observable<Department[]>;
  
  positions$: Observable<Position[]>;

  filteredManagers$!: Observable<ManagerOption[]>;

  statusOptions = ['active', 'on_leave', 'terminated'];

  constructor(
    private fb: FormBuilder,
    private departmentService: DepartmentService,
    private positionService: PositionService,
    private persistenceService: FormPersistenceService,
    private cdr: ChangeDetectorRef
  ) {
    this.departments$ = this.departmentService.getDepartments().pipe(map(res => res.data));
    this.positions$ = this.positionService.getPositions().pipe(map(res => res.data));
    this.employeeForm = this.fb.group({
      // 1. Personal Info
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      gender: [null as Gender | null, Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s\-\(\)]+$/)]], // Basic phone regex
      address: ['', [Validators.required]],
      birthdate: [null, [Validators.required]],
      // NOTE: avatar is NOT in the form - handled separately to avoid browser restrictions

      // 2. Employment Details
      departmentId: [null, Validators.required],
      positionId: [null, Validators.required],
      managerId: [null], // Autocomplete
      status: ['active', Validators.required],
      hiredAt: [new Date(), Validators.required],
      contractEndDate: [null]
    });
  }

  ngOnInit(): void {
    this.persistenceService.restore(this.STORAGE_KEY, this.employeeForm);
  }

  ngOnDestroy(): void {
    this.saveDraft();
  }

  public saveDraft(): void {
    if (this.employeeForm.dirty) {
      this.persistenceService.save(this.STORAGE_KEY, this.employeeForm);
    }
  }

  public restoreDraft(): boolean {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (!saved) {
      return false;
    }
    this.persistenceService.restore(this.STORAGE_KEY, this.employeeForm);
    return true;
  }

  ngAfterViewInit(): void {}

  openImageOverlay(): void {
    this.showImageOverlay = true;
  }

  closeImageOverlay(): void {
    this.showImageOverlay = false;
  }

  // File Upload Handler
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      // Store file separately - NOT in the form control
      this.avatarFile = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        this.avatarPreview = reader.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);

      // Reset the file input so re-selecting the same file works reliably
      input.value = '';
    }
  }

  // Helper to reset form and file input (public so parent can invoke)
  public resetForm(): void {
    this.employeeForm.reset({ status: 'active', hiredAt: new Date() });
    this.employeeForm.markAsPristine();
    this.employeeForm.markAsUntouched();
    this.avatarFile = null;
    this.avatarPreview = null;
  }

  // Form Submission
  onSubmit(): void {
    if (this.employeeForm.valid) {
      const formValue = this.employeeForm.getRawValue();
      const payload = this.buildFormData(formValue);
      this.persistenceService.clear(this.STORAGE_KEY);
      this.employeeForm.markAsPristine();
      this.save.emit(payload);
    } else {
      this.employeeForm.markAllAsTouched();
    }
  }

  private buildFormData(formValue: Record<string, unknown>): FormData {
    const formData = new FormData();

    Object.entries(formValue).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        return;
      }

      let normalizedValue: unknown = value;
      if (this.isRecord(normalizedValue) && 'id' in normalizedValue) {
        normalizedValue = normalizedValue['id'];
      }

      if (this.isDateField(key) && this.isDateValue(normalizedValue)) {
        formData.append(key, this.formatDateToUtcMidnight(normalizedValue));
      } else if (Array.isArray(normalizedValue)) {
        normalizedValue.forEach(item => {
          formData.append(`${key}[]`, item instanceof Blob ? item : String(item));
        });
      } else {
        formData.append(key, String(normalizedValue));
      }
    });

    if (this.avatarFile) {
      formData.append('profileImage', this.avatarFile);
    }
    // If we're editing an existing employee, we need to spoof the PUT method
    if (this.employeeData) {
      formData.append('_method', 'PUT');
    }
    return formData;
  }

  private isDateField(key: string): boolean {
    return this.dateFieldNames.has(key);
  }

  private isDateValue(value: unknown): value is Date | string {
    return value instanceof Date || (typeof value === 'string' && !Number.isNaN(Date.parse(value)));
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private formatDateToUtcMidnight(value: Date | string): string {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value.toString();
    }
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const year = utcDate.getUTCFullYear();
    const month = String(utcDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(utcDate.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}T00:00:00+00:00`;
  }

  // Helper for Autocomplete display
  displayManagerFn(manager: ManagerOption): string {
    return manager && manager.name ? manager.name : '';
  }

}
