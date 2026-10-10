import { Component, Input, OnChanges, OnInit, OnDestroy, SimpleChanges } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelect } from '@angular/material/select';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-select-all',
  standalone: true,
  imports: [MatCheckboxModule],
  templateUrl: './select-all.html',
  styleUrl: './select-all.scss',
})
export class SelectAllComponent implements OnChanges, OnInit, OnDestroy {
  @Input() values: unknown[] = [];
  
  isAllSelected = false;
  isPartiallySelected = false;
  private destroy$ = new Subject<void>();

  constructor(private matSelect: MatSelect) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['values']) {
      this.updateState(this.matSelect.value ?? []);
    }
  }

  ngOnInit() {
    this.updateState(this.matSelect.value ?? []);

    // Watch for changes in the parent mat-select to update the checkbox state
    this.matSelect.valueChange
      .pipe(takeUntil(this.destroy$))
      .subscribe((selectedValues: Array<number | string>) => {
        this.updateState(selectedValues);
      });
  }

  toggleSelection(isSelected: boolean) {
    const allValues: Array<number | string> = [];
    for (const value of this.values) {
      const option: unknown = value;
      if (typeof option === 'string') {
        allValues.push(option);
        continue;
      }
      if (typeof option === 'object' && option !== null && 'id' in option) {
        const id = (option as Record<string, unknown>)['id'];
        if (typeof id === 'number') {
          allValues.push(id);
          continue;
        }
      }
      allValues.push(String(option));
    }

    if (isSelected) {
      this.matSelect.value = allValues;
    } else {
      this.matSelect.value = [];
    }
  }

  private updateState(selectedValues: Array<number | string>) {
    const selectedCount = selectedValues?.length || 0;
    this.isAllSelected = selectedCount === this.values.length && this.values.length > 0;
    this.isPartiallySelected = selectedCount > 0 && selectedCount < this.values.length;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}