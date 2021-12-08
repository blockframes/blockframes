import { TestBed } from '@angular/core/testing';
import { InvitationService } from './invitation.service';
import { InvitationStore } from './invitation.store';
import { Invitation } from './invitation.model';
import { AngularFireModule } from '@angular/fire';
import { toDate } from '@blockframes/utils/helpers';
import { SETTINGS, AngularFirestoreModule, AngularFirestore } from '@angular/fire/firestore';
import { loadFirestoreRules, clearFirestoreData } from '@firebase/testing';
import { readFileSync } from 'fs';
import { createInvitation, InvitationDocument } from './invitation.firestore';
import firebase  from 'firebase/app';
type Timestamp = firebase.firestore.Timestamp;


describe('Invitations Test Suite', () => {
  let service: InvitationService;
  let db: AngularFirestore;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        AngularFireModule.initializeApp({ projectId: 'test' }),
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

  afterEach(() => clearFirestoreData({ projectId: 'test' }));

  // To prevent "This usually means that there are asynchronous operations that weren't stopped in your tests. Consider running Jest with `--detectOpenHandles` to troubleshoot this issue."
  afterAll(() => db.firestore.disableNetwork());

  it('Should check invitation service is created', () => {
    expect(service).toBeTruthy();
  })

  //TODO: 
  // test formatFromFirestore returns correct format
  // test formatToFirestore returns correct format
  // Create an invitation and check .
  
  it.only('Formats invitation from firestore', () => {
    const is = TestBed.inject(InvitationService);
    const today = new Date();
    const timestamp = firebase.firestore.Timestamp.fromDate(today);
    //is.formatFromFirestore = jest.fn();
    //is.formatFromFirestore({} as InvitationDocument);
    //expect(is.formatFromFirestore).toHaveBeenCalled();
    const formattedDate = toDate(timestamp);
    //Create an Invitation Document
    const newInvite:Invitation = createInvitation();
    const invite:InvitationDocument = {...newInvite, ...{date: timestamp}}
    const formattedInvite = is.formatFromFirestore(invite);
    expect(formattedInvite.date).toEqual(formattedDate);
  });

  it('Formats invitation to firestore', () => {
    const is = TestBed.inject(InvitationService);
    is.formatToFirestore = jest.fn();
    is.formatToFirestore(createInvitation());
    expect(is.formatToFirestore).toHaveBeenCalled();
    // TODO: issue#3415 test the output value
  });

  it('Should invitation status become accepted', async () => {
    await db.doc('invitations/1').set({ status: 'pending' });
    await service.acceptInvitation({
      id: '1',
      type: 'attendEvent',
      mode: 'invitation',
      status: 'pending',
      date: new Date()
    });
    const doc = await db.doc('invitations/1').ref.get();
    expect((doc.data() as InvitationDocument).status).toBe('accepted');
  });

  it('Should invitation status become declined', async () => {
    await db.doc('invitations/2').set({ status: 'pending' });
    await service.declineInvitation({
      id: '2',
      type: 'attendEvent',
      mode: 'invitation',
      status: 'pending',
      date: new Date()
    });
    const doc = await db.doc('invitations/2').ref.get();
    expect((doc.data() as InvitationDocument).status).toBe('declined');
  });

  // TODO: issue#3415 implements tests for others functions
});
