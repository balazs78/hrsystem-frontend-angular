import { Component } from '@angular/core';
import { UserTable } from './user-table/user-table';

@Component({
  selector: 'app-users',
  imports: [UserTable],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users {

}