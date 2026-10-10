import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Employee } from '../../../models/employee.interface';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { ReplaceUnderscorePipe } from '../../../pipes/replace-underscore-pipe';

@Component({
  selector: 'app-employee-view',
  imports: [
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    DatePipe,
    TitleCasePipe,
    ReplaceUnderscorePipe
  ],
  templateUrl: './employee-view.html',
  styleUrl: './employee-view.scss',
})
export class EmployeeView {
  @Input() employee: Employee | null = null;
  @Output() cancel = new EventEmitter<void>();
}
