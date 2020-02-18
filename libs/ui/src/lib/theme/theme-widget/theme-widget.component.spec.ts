import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThemeWidgetComponent } from './theme-widget.component';
import { material } from './theme-widget.module';

describe('ThemeWidgetComponent', () => {
  let component: ThemeWidgetComponent;
  let fixture: ComponentFixture<ThemeWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThemeWidgetComponent ],
      imports: [...material]
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
