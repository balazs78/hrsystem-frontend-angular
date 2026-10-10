import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DepartmentView } from './department-view';

describe('DepartmentView', () => {
  let component: DepartmentView;
  let fixture: ComponentFixture<DepartmentView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartmentView],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {}
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepartmentView);
    component = fixture.componentInstance;
    component.data = {
      id: 1,
      name: 'HR',
      costCenterCode: 'HR001',
      createdAt: '2023-01-01',
      manager: { id: 1, fullName: 'John Doe' }
    };
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
