import { Component, Inject } from '@angular/core';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Department } from '../../../models/department.interface'; 
import { PrimaryButton } from '../../common/primary-button/primary-button';

@Component({
  selector: 'app-department-view',
  imports: [
    MatDialogModule,
    PrimaryButton
  ],
  templateUrl: './department-view.html',
  styleUrl: './department-view.scss',
})
export class DepartmentView {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Department
  ){}
}
