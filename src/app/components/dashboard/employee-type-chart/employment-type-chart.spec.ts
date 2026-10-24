import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmploymentTypeChart } from './employment-type-chart';

describe('EmploymentTypeChart', () => {
  let component: EmploymentTypeChart;
  let fixture: ComponentFixture<EmploymentTypeChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmploymentTypeChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmploymentTypeChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
