import { Component } from '@angular/core';
import { PositionTable } from './position-table/position-table';

@Component({
  selector: 'app-positions',
  imports: [PositionTable],
  templateUrl: './positions.html',
  styleUrl: './positions.scss',
})
export class Positions {

}
