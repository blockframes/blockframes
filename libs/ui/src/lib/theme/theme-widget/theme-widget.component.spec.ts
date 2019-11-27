import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThemeWidgetComponent } from './theme-widget.component';

describe('ThemeWidgetComponent', () => {
  let component: ThemeWidgetComponent;
  let fixture: ComponentFixture<ThemeWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThemeWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThemeWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
