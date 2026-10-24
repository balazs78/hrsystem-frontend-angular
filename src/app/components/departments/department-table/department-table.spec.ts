import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentTable } from './department-table';
import { MatSort } from '@angular/material/sort';

describe('DepartmentTable', () => {
  let component: DepartmentTable;
  let fixture: ComponentFixture<DepartmentTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartmentTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepartmentTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to asc sorting by name and disable the clear state', () => {
    component.sort = {
      active: '',
      direction: '',
      sortChange: { emit: vi.fn() }
    } as unknown as MatSort;

    component.initialSort();

    expect(component.sort.active).toBe('name');
    expect(component.sort.direction).toBe('asc');
    expect(component.sort.sortChange.emit).toHaveBeenCalledWith({ active: 'name', direction: 'asc' });

    const table = fixture.nativeElement.querySelector('table');
    expect(table.getAttribute('matSortDisableClear')).not.toBeNull();
  });
});
