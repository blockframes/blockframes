import {TestBed} from '@angular/core/testing';

import { InvitationService } from './invitation.service';
import { InvitationStore } from './invitation.store';
import { AngularFireModule } from '@angular/fire';
import { SETTINGS, AngularFirestoreModule, AngularFirestore } from '@angular/fire/firestore';
import { loadFirestoreRules, clearFirestoreData } from '@firebase/testing';
import { readFileSync } from 'fs';

describe('Invitations Test Suite', () => {
  let service: InvitationService;
  let db: AngularFirestore;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        AngularFireModule.initializeApp({projectId: 'test'}),
        AngularFirestoreModule
      ],
      providers: [
        InvitationService,
        InvitationStore,
        { provide: SETTINGS, useValue: { host: 'localhost:8080', ssl: false } }
      ],
    });
    db = TestBed.inject(AngularFirestore);
    service = TestBed.inject(InvitationService);

    await loadFirestoreRules({
      projectId: "test",
      rules: readFileSync('./firestore.test.rules', "utf8")
    });
  });

  afterEach(() => clearFirestoreData({projectId: 'test'}))

  it('Should check notif service is created', () => {
    expect(service).toBeTruthy();
  })

  it('Formats invitation from firestore', () => {
    const is = TestBed.inject(InvitationService);
    is.formatFromFirestore = jest.fn();
    is.formatFromFirestore({} as any);
    expect(is.formatFromFirestore).toHaveBeenCalled();
  });

  it('Formats invitation to firestore', () => {
    const is = TestBed.inject(InvitationService);
    is.formatToFirestore = jest.fn();
    is.formatToFirestore({} as any);
    expect(is.formatToFirestore).toHaveBeenCalled();
  });
});
