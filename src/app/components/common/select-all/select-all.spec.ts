import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSelect } from '@angular/material/select';
import { of } from 'rxjs';
import { SelectAllComponent } from './select-all';

describe('SelectAllComponent', () => {
  let component: SelectAllComponent;
  let fixture: ComponentFixture<SelectAllComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectAllComponent],
      providers: [{
        provide: MatSelect,
        useValue: {
          value: [],
          valueChange: of([])
        }
      }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectAllComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
