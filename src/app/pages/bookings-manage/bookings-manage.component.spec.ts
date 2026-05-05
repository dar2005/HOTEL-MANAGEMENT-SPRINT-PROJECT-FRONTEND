import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingsManageComponent } from './bookings-manage.component';

describe('BookingsManageComponent', () => {
  let component: BookingsManageComponent;
  let fixture: ComponentFixture<BookingsManageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ BookingsManageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingsManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
