import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomsManageComponent } from './rooms-manage.component';

describe('RoomsManageComponent', () => {
  let component: RoomsManageComponent;
  let fixture: ComponentFixture<RoomsManageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ RoomsManageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomsManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
