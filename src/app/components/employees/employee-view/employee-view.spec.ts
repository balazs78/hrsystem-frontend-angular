import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeView } from './employee-view';

describe('EmployeeView', () => {
  let component: EmployeeView;
  let fixture: ComponentFixture<EmployeeView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeView);
    component = fixture.componentInstance;
    component.employee = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      fullName: 'John Doe',
      gender: 'male',
      birthdate: '1990-01-01',
      address: '123 Main St, Anytown, USA',
      history: [],
      phone: '123-456-7890',
      status: 'active',
      email: 'john.doe@example.com',
      avatarUrl: 'https://example.com/avatar.jpg',
      department: {
        id: 1,
        name: 'HR',
        costCenterCode: 'HR001',
        createdAt: '2023-01-01',
        manager: { id: 1, fullName: 'John Doe' }
      },
      position: {
        id: 1,
        title: 'Software Engineer',
        description: 'Responsible for developing software applications.',
        salaryGrade: 'G5',
        createdAt: '2023-01-01',
        headcount: 10
      },
      hiredAt: '2023-01-01',
      profileImage: 'https://example.com/profile.jpg',
      contractEndDate: '2024-01-01',
      manager: {
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        fullName: 'Jane Smith',
      },
      updatedAt: '2023-01-01'
    };
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows a fallback when the employee has no manager', async () => {
    fixture.componentRef.setInput('employee', { ...component.employee!, manager: null });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('No Manager Assigned');
  });
});
