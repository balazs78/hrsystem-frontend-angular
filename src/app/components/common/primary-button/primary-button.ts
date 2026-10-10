import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-primary-button',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './primary-button.html',
  styleUrl: './primary-button.scss'
})
export class PrimaryButton {
  @Input() disabled = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'submit';
}