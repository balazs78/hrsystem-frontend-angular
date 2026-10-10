import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PositionForm } from './position-form';

describe('PositionForm', () => {
  let component: PositionForm;
  let fixture: ComponentFixture<PositionForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PositionForm],
      providers: [
        // 👈 Create a stub provider for the dialog reference
        {
          provide: MatDialogRef,
          useValue: {
            close: () => {} // Mocks the close method if your form calls this.close()
          }
        },
         {
          provide: MAT_DIALOG_DATA,
          useValue: null // 👈 Passing null mimics opening the form in "Create Mode" cleanly
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PositionForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
