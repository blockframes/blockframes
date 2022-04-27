﻿process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
import { TestBed } from '@angular/core/testing';
import { InvitationService } from './invitation.service';
import { AuthService } from '@blockframes/auth/+state';
import {
  Firestore,
  connectFirestoreEmulator,
  disableNetwork,
  doc,
  setDoc,
  getDoc,
} from '@angular/fire/firestore';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { clearFirestoreData } from 'firebase-functions-test/lib/providers/firestore';
import { readFileSync } from 'fs';
import { Observable, of } from 'rxjs';
import { UserService } from '@blockframes/user/+state/user.service';
import { AnalyticsService } from '@blockframes/analytics/+state/analytics.service';
import { createInvitation, createUser, InvitationDocument } from '@blockframes/model';
import { ActivatedRoute } from '@angular/router';
import { APP } from '@blockframes/utils/routes/utils';
import { getApp, initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { connectFunctionsEmulator, Functions, getFunctions, provideFunctions } from '@angular/fire/functions';
import { FIREBASE_CONFIG, FIRESTORE_SETTINGS } from 'ngfire';

class InjectedAuthService {
  uid = 'userId';

  profile = {
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
  let db: Firestore;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        provideFirebaseApp(() => initializeApp({ projectId: 'test' })),// TODO #8280 remove

        provideFunctions(() => {// TODO #8280 remove
          const functions = getFunctions(getApp());
          connectFunctionsEmulator(functions, 'localhost', 5001);
          return functions;
        }),
      ],
      providers: [
        InvitationService,
        { provide: AuthService, useClass: InjectedAuthService },
        { provide: UserService, useClass: DummyService },
        { provide: AnalyticsService, useClass: DummyService },
        { provide: ActivatedRoute, useValue: { params: of({}) } },
        { provide: APP, useValue: 'festival' },
        {
          provide: FIREBASE_CONFIG, useValue:
          {
            options: { projectId: 'test' },
            firestore: (firestore: Firestore) => {
              if (db) return db;
              connectFirestoreEmulator(firestore, 'localhost', 8080);
            },
            functions: (functions: Functions) => {
              connectFunctionsEmulator(functions, 'localhost', 5001);
            }
          }
        },
        { provide: FIRESTORE_SETTINGS, useValue: { ignoreUndefinedProperties: true, experimentalAutoDetectLongPolling: true } }
      ],
    });

    service = TestBed.inject(InvitationService);
    db = service._db;
    await initializeTestEnvironment({
      projectId: 'test',
      firestore: { rules: readFileSync('./firestore.test.rules', 'utf8') }
    });

  });

  afterEach(() => clearFirestoreData({ projectId: 'test' }));

  // To prevent "This usually means that there are asynchronous operations that weren't stopped in your tests. Consider running Jest with `--detectOpenHandles` to troubleshoot this issue."
  afterAll(() => disableNetwork(db));

  it('Should check invitation service is created', () => {
    expect(service).toBeTruthy();
  })


  it('Formats invitation to firestore', () => {
    const invitationService = TestBed.inject(InvitationService);

    //Create an Invitation Document
    const inviteData = { ...invitationParamsOrg, ...invitationParamsUser };
    const inviteParams = { ...inviteData, ...{ message: 'Clean it', watchTime: undefined } };
    const newInvite = createInvitation(inviteParams);
    const formattedInvite = invitationService.toFirestore(newInvite);
    expect(formattedInvite).toMatchObject(inviteData);
  });

  it('Should invitation status become accepted', async () => {
    const ref = doc(db, 'invitations/1');
    await setDoc(ref, { status: 'pending' });
    await service.acceptInvitation({
      id: '1',
      type: 'attendEvent',
      mode: 'invitation',
      status: 'pending',
      date: new Date()
    });
    const invitation = await getDoc(ref);
    expect((invitation.data() as InvitationDocument).status).toBe('accepted');
  });

  it('Should invitation status become declined', async () => {
    const ref = doc(db, 'invitations/2');
    await setDoc(ref, { status: 'pending' });
    await service.declineInvitation({
      id: '2',
      type: 'attendEvent',
      mode: 'invitation',
      status: 'pending',
      date: new Date()
    });
    const invitation = await getDoc(ref);
    expect((invitation.data() as InvitationDocument).status).toBe('declined');
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
});
