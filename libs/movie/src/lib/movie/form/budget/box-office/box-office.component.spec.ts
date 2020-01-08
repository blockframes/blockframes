import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BoxOfficeComponent } from './box-office.component';

describe('BoxOfficeComponent', () => {
  let component: BoxOfficeComponent;
  let fixture: ComponentFixture<BoxOfficeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BoxOfficeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoxOfficeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
