import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaImageComponent } from './media-image.component';

describe('MediaImageComponent', () => {
  let component: MediaImageComponent;
  let fixture: ComponentFixture<MediaImageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MediaImageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
