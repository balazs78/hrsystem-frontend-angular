import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerVsEmployeeChart } from './manager-vs-employee-chart';

describe('ManagerVsEmployeeChart', () => {
  let component: ManagerVsEmployeeChart;
  let fixture: ComponentFixture<ManagerVsEmployeeChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagerVsEmployeeChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagerVsEmployeeChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
