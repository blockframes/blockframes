import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailsComponent } from './avails.component';

describe('AvailsComponent', () => {
  let component: AvailsComponent;
  let fixture: ComponentFixture<AvailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AvailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AvailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
