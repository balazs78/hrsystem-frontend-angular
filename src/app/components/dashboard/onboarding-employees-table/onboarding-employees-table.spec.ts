import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingEmployeesTable } from './onboarding-employees-table';

describe('OnboardingEmployeesTable', () => {
  let component: OnboardingEmployeesTable;
  let fixture: ComponentFixture<OnboardingEmployeesTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardingEmployeesTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnboardingEmployeesTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show an empty state when there are no onboarding employees', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No onboarding employees');
  });

  it('should paginate at five rows per page', () => {
    expect(component.pageSize).toBe(5);
    expect(component.pageSizeOptions).toContain(5);
  });
});
