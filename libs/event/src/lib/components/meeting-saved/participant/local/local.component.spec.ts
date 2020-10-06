import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalComponent } from './local.component';

describe('LocalComponent', () => {
  let component: LocalComponent;
  let fixture: ComponentFixture<LocalComponent>;

  const arr = [
    { key: 'foo', val: 'bar' },
    { key: 'hello', val: 'world' }
  ];
  const result = new Map(arr.map(i => [i.key, i.val]));

  const audioEl = document.createElement('audio');

  const testParticipant = {
    identity: 'testIdentity',
    lastName: 'testLastName',
    firstName: 'testFirstName',
    tracks: result,
    on:jest.fn((d) => {
      d = {
        trackSubscribed: jest.fn((q) => q)
      }
      return d;
    })
  }

  const testPreviewTrack = [
    {
      kind: 'audio',
      attach: jest.fn(() => audioEl),
      detach: jest.fn(() => [audioEl])
    },
    {
      kind: 'video',
      attach: jest.fn(() => audioEl),
      detach: jest.fn(() => [audioEl])

    }
  ]

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LocalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocalComponent);
    fixture.componentInstance.localParticipant = testParticipant;
    fixture.componentInstance.localPreviewTracks = testPreviewTrack;
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
