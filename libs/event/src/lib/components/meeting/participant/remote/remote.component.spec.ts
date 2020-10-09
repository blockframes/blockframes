import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoteComponent } from './remote.component';

describe('RemoteComponent', () => {
  let component: RemoteComponent;
  let fixture: ComponentFixture<RemoteComponent>;
  const arr = [
    { key: 'foo', val: 'bar' },
    { key: 'hello', val: 'world' }
  ];
  const result = new Map(arr.map(i => [i.key, i.val]));
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


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RemoteComponent ]
    })
    .compileComponents();

  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RemoteComponent);
    fixture.componentInstance.participant = testParticipant;
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
