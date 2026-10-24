import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { PasswordUpdateComponent } from '../../common/password-update-component/password-update-component';

@Component({
  selector: 'app-profile-settings-component',
  imports: [
    MatCardModule,
    PasswordUpdateComponent,
  ],
  templateUrl: './profile-settings-component.html',
  styleUrl: './profile-settings-component.scss',
})
export class ProfileSettingsComponent {

}
