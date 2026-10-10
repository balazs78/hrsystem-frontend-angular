import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DepartmentForm } from './department-form';

describe('DepartmentForm', () => {
  let component: DepartmentForm;
  let fixture: ComponentFixture<DepartmentForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartmentForm],
      providers: [
        {
          provide: MatDialogRef,
          useValue: {
            close: () => {} // Mocks the dialog close action
          }
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {} // Mocks data passed into the form
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepartmentForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
