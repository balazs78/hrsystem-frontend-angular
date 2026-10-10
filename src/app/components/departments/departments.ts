import { Component } from '@angular/core';
import { DepartmentTable } from './department-table/department-table';

@Component({
  selector: 'app-departments',
  imports: [DepartmentTable],
  templateUrl: './departments.html',
  styleUrl: './departments.scss',
})
export class Departments {
  
}
