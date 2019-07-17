import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MovieDisplayMainComponent } from './main.component';

describe('MovieDisplayMainComponent', () => {
  let component: MovieDisplayMainComponent;
  let fixture: ComponentFixture<MovieDisplayMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MovieDisplayMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MovieDisplayMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
