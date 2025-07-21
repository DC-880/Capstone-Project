import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentTracking } from './payment-tracking';

describe('PaymentTracking', () => {
  let component: PaymentTracking;
  let fixture: ComponentFixture<PaymentTracking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentTracking]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentTracking);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
