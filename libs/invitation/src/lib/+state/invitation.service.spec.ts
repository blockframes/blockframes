import { TestBed } from '@angular/core/testing';
import { InvitationService } from './invitation.service';
import { AuthService, createUser } from '@blockframes/auth/+state';
import { AngularFireModule } from '@angular/fire';
import { toDate } from '@blockframes/utils/helpers';
import { SETTINGS, AngularFirestoreModule, AngularFirestore } from '@angular/fire/firestore';
import { loadFirestoreRules, clearFirestoreData } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { createInvitation, InvitationDocument } from './invitation.firestore';
import firebase from 'firebase/app';
import { Observable } from 'rxjs';
import { UserService } from '@blockframes/user/+state/user.service';

class InjectedAuthService {
  profile = {
    uid: 'userId',
    orgId: 'orgId',
  }

  profile$ = new Observable();

}

class DummyService { }

const today = new Date();
const invitationParamsOrg = {
  date: today,
  toOrg: {
    id: 'orgId',
    denomination: { full: 'MyOrg' },
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
        { provide: AuthService, useClass: InjectedAuthService },
        { provide: UserService, useClass: DummyService },
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
    const invitationService = TestBed.inject(InvitationService);
    const timestamp = firebase.firestore.Timestamp.fromDate(today);
    const formattedDate = toDate(timestamp);

    //Create an Invitation Document
    const newInvite = createInvitation();
    const invite: InvitationDocument = { ...newInvite, ...{ date: timestamp } }
    const formattedInvite = invitationService.formatFromFirestore(invite);
    expect(formattedInvite.date).toEqual(formattedDate);
  });

  it('Formats invitation to firestore', () => {
    const invitationService = TestBed.inject(InvitationService);

    //Create an Invitation Document
    const inviteData = { ...invitationParamsOrg, ...invitationParamsUser };
    const inviteParams = { ...inviteData, ...{ message: 'Clean it', watchTime: undefined } };
    const newInvite = createInvitation(inviteParams);
    const formattedInvite = invitationService.formatToFirestore(newInvite);
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
    const requestBy = createUser({
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
    })

    const invitationService = TestBed.inject(InvitationService);
    const mock = jest.spyOn(invitationService, 'add');

    const requestOutput = invitationService.request('O002', requestBy);
    await requestOutput.to('attendEvent', 'E001');
    expect(invitationService.add).toHaveBeenCalled();
    const inviteParam = mock.mock.calls[0][0];
    const expectedParam = {
      type: 'attendEvent',
      eventId: 'E001',
      toOrg: { id: 'O002' },
      fromUser: { uid: 'userId', orgId: 'O001' }
    }
    expect(inviteParam).toMatchObject(expectedParam);
  });

  describe('Check Invitation', () => {

    it('is for my org', async () => {
      const invitationService = TestBed.inject(InvitationService);

      //Create an Invitation Document
      const newInvite = createInvitation(invitationParamsOrg);
      const isMyInvite = invitationService.isInvitationForMe(newInvite);
      expect(isMyInvite).toBeTruthy();
    })

    it('is for my userId', async () => {
      const invitationService = TestBed.inject(InvitationService);

      //Create an Invitation Document
      const newInvite = createInvitation(invitationParamsUser);
      const isMyInvite = invitationService.isInvitationForMe(newInvite);
      expect(isMyInvite).toBeTruthy();
    })

    it('is neither for my Org or userId', async () => {
      const invitationService = TestBed.inject(InvitationService);

      //Create an Invitation Document
      const inviteParamsOrg = { ...invitationParamsOrg };
      const inviteParamsUser = { ...invitationParamsUser };
      inviteParamsOrg.toOrg.id = 'otherOrgId';
      inviteParamsUser.toUser.uid = 'otherUserId';
      const invitationParams = { ...inviteParamsOrg, ...inviteParamsUser };
      const newInvite = createInvitation(invitationParams);
      const isMyInvite = invitationService.isInvitationForMe(newInvite);
      expect(isMyInvite).toBeFalsy();
    })
  })
});
