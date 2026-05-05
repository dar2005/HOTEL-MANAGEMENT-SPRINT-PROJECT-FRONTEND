import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentsManageComponent } from './payments-manage.component';

describe('PaymentsManageComponent', () => {
  let component: PaymentsManageComponent;
  let fixture: ComponentFixture<PaymentsManageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ PaymentsManageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentsManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
