import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpiringContractsTable } from './expiring-contracts-table';

describe('ExpiringContractsTable', () => {
  let component: ExpiringContractsTable;
  let fixture: ComponentFixture<ExpiringContractsTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpiringContractsTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpiringContractsTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show an empty state when there are no expiring contracts', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No expiring contracts');
  });

  it('should paginate at five rows per page', () => {
    expect(component.pageSize).toBe(5);
    expect(component.pageSizeOptions).toContain(5);
  });
});
