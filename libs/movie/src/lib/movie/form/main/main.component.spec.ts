import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MovieFormMainComponent } from './main.component';

describe('MovieFormMainComponent', () => {
  let component: MovieFormMainComponent;
  let fixture: ComponentFixture<MovieFormMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MovieFormMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MovieFormMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
