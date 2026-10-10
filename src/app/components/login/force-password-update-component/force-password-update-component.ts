import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { PasswordUpdateComponent } from '../../common/password-update-component/password-update-component';
@Component({
  selector: 'app-force-password-update-component',
  imports: [
    MatCardModule,
    PasswordUpdateComponent,
  ],
  templateUrl: './force-password-update-component.html',
  styleUrl: './force-password-update-component.scss',
})
export class ForcePasswordUpdateComponent {

}
