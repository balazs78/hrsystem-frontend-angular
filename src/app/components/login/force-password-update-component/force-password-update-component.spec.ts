import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForcePasswordUpdateComponent } from './force-password-update-component';

describe('ForcePasswordUpdateComponent', () => {
  let component: ForcePasswordUpdateComponent;
  let fixture: ComponentFixture<ForcePasswordUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForcePasswordUpdateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForcePasswordUpdateComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
