import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceCreation } from './invoice-creation';

describe('InvoiceCreation', () => {
  let component: InvoiceCreation;
  let fixture: ComponentFixture<InvoiceCreation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoiceCreation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceCreation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
