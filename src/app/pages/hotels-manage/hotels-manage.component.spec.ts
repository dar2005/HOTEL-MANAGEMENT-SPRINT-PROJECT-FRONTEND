import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HotelsManageComponent } from './hotels-manage.component';

describe('HotelsManageComponent', () => {
  let component: HotelsManageComponent;
  let fixture: ComponentFixture<HotelsManageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ HotelsManageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HotelsManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HotelsManageComponent } from './hotels-manage.component';

describe('HotelsManageComponent', () => {
  let component: HotelsManageComponent;
  let fixture: ComponentFixture<HotelsManageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ HotelsManageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HotelsManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
