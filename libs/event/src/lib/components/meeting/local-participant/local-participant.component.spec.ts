import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalParticipantComponent } from './local-participant.component';

describe('LocalParticipantComponent', () => {
  let component: LocalParticipantComponent;
  let fixture: ComponentFixture<LocalParticipantComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LocalParticipantComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocalParticipantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
