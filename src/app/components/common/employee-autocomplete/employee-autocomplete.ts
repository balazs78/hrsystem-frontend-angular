import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { EmployeeBasic } from '../../../models/employee-basic.interface';
import { Observable } from 'rxjs/internal/Observable';
import { EmployeeService } from '../../../services/employee.service';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { distinctUntilChanged } from 'rxjs/internal/operators/distinctUntilChanged';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { of, tap } from 'rxjs';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatFormField, MatLabel } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-employee-autocomplete',
  imports: [
    MatAutocompleteModule,
    MatFormField,
    MatInputModule,
    MatLabel,
    MatIcon,
    ReactiveFormsModule,
    AsyncPipe,
  ],
  templateUrl: './employee-autocomplete.html',
  styleUrl: './employee-autocomplete.scss',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: EmployeeAutocomplete,
    multi: true
  }]
})
export class EmployeeAutocomplete implements OnInit, ControlValueAccessor {
  @Input() label: string = 'Employee';
  @Input() allStatuses: boolean = false;
  @Output() selectionChange = new EventEmitter<EmployeeBasic | null>();
  filteredManagers$!: Observable<EmployeeBasic[]>;
  inputControl = new FormControl<string | EmployeeBasic>('');

  constructor(private employeeService: EmployeeService)  {}

  ngOnInit(): void {
  this.filteredManagers$ = this.inputControl.valueChanges.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    tap(value => {
      // If user clears the input, notify parent form of null/empty
      if (!value) {
        this.onChange(null);
        this.selectionChange.emit(null);
      }
    }),
    switchMap(value => {
      if (typeof value === 'string' && value.length > 0) {
        return this.employeeService.searchEmployees(value, this.allStatuses);
      }
      return of([]);
    })
  );
}




   // Helper for Autocomplete
  displayFn(employee: EmployeeBasic): string {
    return employee && employee.fullName ? employee.fullName : '';
  }

  // Callbacks for Angular Forms API
  onChange = (_value: EmployeeBasic | null) => {
  };
  onTouched = () => {};

  // 1. Sets the value from the parent form (e.g. initial load)
  writeValue(value: EmployeeBasic | null): void {
    this.inputControl.setValue(value, { emitEvent: false });
  }

  // 2. Registers the callback to notify parent of changes
  registerOnChange(fn: (value: EmployeeBasic | null) => void): void {
    this.onChange = fn;
  }

  // 3. Registers the callback for "touched" state
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  // Handle blur manually to add delay
  handleBlur(): void {
    // A delay of 0ms moves the execution to the end of the browser's event queue,
    // allowing (optionSelected) to fire first.
    setTimeout(() => {
      this.onTouched();
    }, 100); 
  }

  onOptionSelected(event: MatAutocompleteSelectedEvent) {
    const selectedManager = event.option.value;
    // This notifies the parent 'formControlName="manager"' of the new value
    this.inputControl.setValue(selectedManager, { emitEvent: false });
    this.onChange(selectedManager);
    this.selectionChange.emit(selectedManager);
  }
}
