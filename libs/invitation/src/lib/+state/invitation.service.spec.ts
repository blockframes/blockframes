import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { InvitationService } from './invitation.service';
import { InvitationStore } from './invitation.store';
import { Invitation } from './invitation.model';
import { AuthQuery, User } from '@blockframes/auth/+state';
import { AngularFireModule } from '@angular/fire';
import { toDate } from '@blockframes/utils/helpers';
import { SETTINGS, AngularFirestoreModule, AngularFirestore } from '@angular/fire/firestore';
import { loadFirestoreRules, clearFirestoreData } from '@firebase/testing';
import { readFileSync } from 'fs';
import { createInvitation, InvitationDocument } from './invitation.firestore';
import firebase  from 'firebase/app';

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

const today = new Date();
const invitationParamsOrg = {
  date: today, 
  toOrg: {
    id: 'orgId',
    denomination: {full: 'MyOrg'},
    logo: undefined
  },
};
const invitationParamsUser = {
  date: today, 
  toUser: {
    uid: 'userId',
    email: 'userId@myorg.org'
  }
};

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

  it('Formats invitation from firestore', () => {
    const is = TestBed.inject(InvitationService);
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

    //Create an Invitation Document
    const inviteData = { ...invitationParamsOrg, ...invitationParamsUser }
    const inviteParams = { ...inviteData, ...{ message: 'Clean it', watchTime: undefined} }
    const newInvite:Invitation = createInvitation(inviteParams);
    const formattedInvite = is.formatToFirestore(newInvite);
    expect(formattedInvite).toMatchObject(inviteData);
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

  it('Should create invitation request', async () => {
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
    await requestOutput.to('attendEvent', 'E001');
    expect(is.add).toHaveBeenCalled();
    const inviteParam = mock.mock.calls[0][0];
    const expectedParam = {
      type: 'attendEvent',
      eventId: 'E001',
      toOrg: { id: 'O002'},
      fromUser: { uid: 'userId', orgId: 'O001' }
    }
    expect(inviteParam).toMatchObject(expectedParam);
  });

  describe('Check Invitation', () => {

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
      const inviteParamsOrg = { ...invitationParamsOrg};
      const inviteParamsUser = { ...invitationParamsUser};
      inviteParamsOrg.toOrg.id = 'otherOrgId';
      inviteParamsUser.toUser.uid = 'otherUserId';
      const invitationParams = {...inviteParamsOrg, ...inviteParamsUser};
      const newInvite:Invitation = createInvitation(invitationParams);
      const isMyInvite = is.isInvitationForMe(newInvite);
      expect(isMyInvite).toBeFalsy();
    })
  })
});
