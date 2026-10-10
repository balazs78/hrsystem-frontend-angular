import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PositionTable } from './position-table';
import { MatSort } from '@angular/material/sort';

describe('PositionTable', () => {
  let component: PositionTable;
  let fixture: ComponentFixture<PositionTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PositionTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PositionTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to asc sorting by title and disable the clear state', () => {
    component.sort = {
      active: '',
      direction: '',
      sortChange: { emit: vi.fn() }
    } as unknown as MatSort;

    component.initialSort();

    expect(component.sort.active).toBe('title');
    expect(component.sort.direction).toBe('asc');
    expect(component.sort.sortChange.emit).toHaveBeenCalledWith({ active: 'title', direction: 'asc' });

    const table = fixture.nativeElement.querySelector('table');
    expect(table.getAttribute('matSortDisableClear')).not.toBeNull();
  });
});
