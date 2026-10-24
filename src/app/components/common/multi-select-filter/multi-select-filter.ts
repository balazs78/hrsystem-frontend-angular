import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { SelectAllComponent } from '../select-all/select-all';

@Component({
  selector: 'app-multi-select-filter',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    SelectAllComponent,
  ],
  templateUrl: './multi-select-filter.html'
})
export class MultiSelectFilter<T> {
  @Input() label = '';
  @Input() control = new FormControl<Array<number | string>>([]);
  @Input() values: T[] = [];
  @Input() selectedLabel = '';
  @Input() valueKey = 'id';
  @Input() optionText: (option: T) => string = option => String(option);

  getOptionValue(option: T): number | string {
    if (!this.valueKey) {
      return option as string;
    }
    return (option as { id: number })['id'];
  }
}