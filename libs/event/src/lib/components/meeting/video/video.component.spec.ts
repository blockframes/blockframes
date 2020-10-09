import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {VideoComponent} from './video.component';
import {CommonModule} from "@angular/common";
import {MatGridListModule} from "@angular/material/grid-list";
import {RemoteComponent} from "@blockframes/event/components/meeting/participant/remote/remote.component";
import {LocalComponent} from "@blockframes/event/components/meeting/participant/local/local.component";
import {AngularFireModule} from "@angular/fire";
import {AngularFirestore, AngularFirestoreModule} from "@angular/fire/firestore";
import {Event} from "@blockframes/event/+state";

describe('VideoComponent', () => {
  let component: VideoComponent;
  let fixture: ComponentFixture<VideoComponent>;
  // let service: NotificationService;
  let db: AngularFirestore;
  const testEvents: Event = {
    id: 'EventIdTest',
    isOwner: true,
    allDay: true,
    isPrivate: true,
    end: new Date(),
    start: new Date(),
    ownerId: null,
    meta: null,
    title: 'meeting',
    type: 'meeting',
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        VideoComponent,
        RemoteComponent,
        LocalComponent
      ],
      imports:[
        AngularFireModule.initializeApp({projectId: 'test'}),
        AngularFirestoreModule,
        CommonModule,
        MatGridListModule
      ]
    })
    .compileComponents();
    db = TestBed.inject(AngularFirestore);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoComponent);
    fixture.componentInstance.event = testEvents;
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
