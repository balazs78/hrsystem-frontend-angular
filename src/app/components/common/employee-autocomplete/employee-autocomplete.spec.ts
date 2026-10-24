import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeAutocomplete } from './employee-autocomplete';

describe('EmployeeAutocomplete', () => {
  let component: EmployeeAutocomplete;
  let fixture: ComponentFixture<EmployeeAutocomplete>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeAutocomplete]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeAutocomplete);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
