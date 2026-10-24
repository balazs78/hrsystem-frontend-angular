import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog'; 
import { PositionView } from './position-view';

describe('PositionView', () => {
  let component: PositionView;
  let fixture: ComponentFixture<PositionView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PositionView],
      providers: [
        // 👈 Provide mock data to satisfy the InjectionToken
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            // Add other properties that match the data structure your view displays
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PositionView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
