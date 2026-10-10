import { Component, Inject } from '@angular/core';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Position } from '../../../models/position.interface'; 
import { PrimaryButton } from '../../common/primary-button/primary-button';
@Component({
  selector: 'app-position-view',
  imports: [
    MatDialogModule,
    PrimaryButton
  ],
  templateUrl: './position-view.html',
  styleUrl: './position-view.scss',
})
export class PositionView {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Position
  ){}
}
