import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DominantSpeakerComponent } from './dominant-speaker.component';

describe('DominantSpeakerComponent', () => {
  let component: DominantSpeakerComponent;
  let fixture: ComponentFixture<DominantSpeakerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DominantSpeakerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DominantSpeakerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
