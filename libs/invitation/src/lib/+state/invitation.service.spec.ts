import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { InvitationService } from './invitation.service';
import * as IS from './invitation.service';
import { InvitationStore } from './invitation.store';
import { Invitation } from './invitation.model';
import { AuthQuery, User } from '@blockframes/auth/+state';
import { AngularFireModule } from '@angular/fire';
import { toDate } from '@blockframes/utils/helpers';
import { SETTINGS, AngularFirestoreModule, AngularFirestore } from '@angular/fire/firestore';
import { loadFirestoreRules, clearFirestoreData } from '@firebase/testing';
import { readFileSync } from 'fs';
import { createInvitation, InvitationDocument } from './invitation.firestore';
import * as TestApp from '@blockframes/utils/apps';
import firebase  from 'firebase/app';
type Timestamp = firebase.firestore.Timestamp;


@Injectable()
class InjectedAuthQuery {
  userId: string;
  orgId: string;

  constructor() {
    this.userId = 'userId';
    this.orgId = 'orgId'; 
  }

  select() {
    return {pipe: () => { }}
  }
}

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
        { provide: AuthQuery, useClass: InjectedAuthQuery },
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
  // test formatToFirestore returns correct format
  // Create an invitation and check .
  
  it('Formats invitation from firestore', () => {
    const is = TestBed.inject(InvitationService);
    const today = new Date();
    const timestamp = firebase.firestore.Timestamp.fromDate(today);
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

  //TODO: Optimize the test further..
  
  it.only('Should create invitation request', async () => {
    const requestBy:User = {
      uid: 'userId',
      financing: {
        rank: 'first'
      },
      firstName: 'Unit',
      lastName: 'Tester',
      email: 'userId@myorg.org',
      phoneNumber: '012345',
      position: 'Sr.Tester',
      orgId: 'O001',
      avatar: null,
      privacyPolicy: null
    }


    const is = TestBed.inject(InvitationService);
    const mock = jest.spyOn(is, 'add');

    const requestOutput = is.request('O002', requestBy);
    const invite = await requestOutput.to('attendEvent', 'E001');
    //expect(invite.id).toBeDefined();
    console.log(invite);
    //invite.then(x => console.log(x));
    expect(is.add).toHaveBeenCalled();
    //console.log(mock)
    //expect(mock).toHaveBeenCalled();
    const inviteParam = mock.mock.calls[0][0];
    expect(inviteParam['type']).toBe('attendEvent');
    expect(inviteParam['eventId']).toBe('E001');
  });

  describe('Check Invitation', () => {
    const today = new Date();
    const invitationParamsOrg = {
      date: today, 
      toOrg: {
        id: 'orgId',
        denomination: {full: 'MyOrg'},
        logo: null
      },
    };
    const invitationParamsUser = {
      date: today, 
      toUser: {
        uid: 'userId',
        email: 'userId@myorg.org'
      }
    };

    it('is for my org', async () => {
      const is = TestBed.inject(InvitationService);

      //Create an Invitation Document
      const newInvite:Invitation = createInvitation(invitationParamsOrg);
      const isMyInvite = is.isInvitationForMe(newInvite);
      expect(isMyInvite).toBeTruthy();
    })

    it('is for my userId', async () => {
      const is = TestBed.inject(InvitationService);

      //Create an Invitation Document
      const newInvite:Invitation = createInvitation(invitationParamsUser);
      const isMyInvite = is.isInvitationForMe(newInvite);
      expect(isMyInvite).toBeTruthy();
    })

    it('is neither for my Org or userId', async () => {
      const is = TestBed.inject(InvitationService);

      //Create an Invitation Document
      invitationParamsOrg.toOrg.id = 'otherOrgId';
      invitationParamsUser.toUser.uid = 'otherUserId';
      const invitationParams = {...invitationParamsOrg, ...invitationParamsUser};
      const newInvite:Invitation = createInvitation(invitationParams);
      const isMyInvite = is.isInvitationForMe(newInvite);
      expect(isMyInvite).toBeFalsy();
    })
  })
});
