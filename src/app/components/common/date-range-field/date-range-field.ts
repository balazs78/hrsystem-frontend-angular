import { Component, EventEmitter, Output } from '@angular/core';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-date-range-field',
  standalone: true,
  imports: [
    MatDatepickerModule,
    MatFormFieldModule,
  ],
  templateUrl: './date-range-field.html',
  styleUrl: './date-range-field.scss'
})
export class DateRangeField {
  @Output() startDateChange = new EventEmitter<MatDatepickerInputEvent<Date>>();
  @Output() endDateChange = new EventEmitter<MatDatepickerInputEvent<Date>>();
}