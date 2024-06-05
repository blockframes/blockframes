import { TestBed } from '@angular/core/testing';
import { InvitationService } from './service';
import { AuthService } from '@blockframes/auth/service';
import { Observable, of } from 'rxjs';
import { UserService } from '@blockframes/user/service';
import { AnalyticsService } from '@blockframes/analytics/service';
import { createInvitation, createUser, Invitation } from '@blockframes/model';
import { ActivatedRoute } from '@angular/router';
import { APP } from '@blockframes/utils/routes/utils';
import { FIREBASE_CONFIG } from 'ngfire';

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
    name: 'MyOrg',
    logo: undefined
  },
};
const invitationParamsUser = {
  date: today,
  toUser: {
    uid: 'userId',
    email: 'userId@myorg.org',
    hideEmail: false
  }
};

describe('Invitations Test Suite', () => {
  let service: InvitationService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        InvitationService,
        { provide: AuthService, useClass: InjectedAuthService },
        { provide: UserService, useClass: DummyService },
        { provide: AnalyticsService, useClass: DummyService },
        { provide: ActivatedRoute, useValue: { params: of({}) } },
        { provide: APP, useValue: 'festival' },
        { provide: FIREBASE_CONFIG, useValue: { options: { projectId: 'test' } } }
      ],
    });

    service = TestBed.inject(InvitationService);
    service.add = jest.fn();
    service.update = jest.fn();
  });

  it('Should check if invitation service is created', () => {
    expect(service).toBeTruthy();
  })

  it('Formats invitation to firestore', () => {

    //Create an Invitation Document
    const inviteData = { ...invitationParamsOrg, ...invitationParamsUser };
    const inviteParams = { ...inviteData, ...{ message: 'Clean it' } };
    const newInvite = createInvitation(inviteParams);
    const formattedInvite = service.toFirestore(newInvite);
    expect(formattedInvite.message).toBe(undefined);
  });

  it('Should invitation status become accepted', async () => {
    const mock = jest.spyOn(service, 'update');

    const invitation: Invitation = {
      id: '1',
      type: 'attendEvent',
      mode: 'invitation',
      status: 'pending',
      date: new Date()
    };
    await service.acceptInvitation(invitation);

    expect(service.update).toHaveBeenCalled();
    const { id, status } = mock.mock.calls[0][0] as unknown as Invitation;

    expect(id).toBe(invitation.id);
    expect(status).toBe('accepted');
  });

  it('Should invitation status become declined', async () => {
    const mock = jest.spyOn(service, 'update');

    const invitation: Invitation = {
      id: '2',
      type: 'attendEvent',
      mode: 'invitation',
      status: 'pending',
      date: new Date()
    };

    await service.declineInvitation(invitation);

    expect(service.update).toHaveBeenCalled();
    const { id, status } = mock.mock.calls[0][0] as unknown as Invitation;

    expect(id).toBe(invitation.id);
    expect(status).toBe('declined');
  });

  it('Should create invitation request', async () => {
    const requestBy = createUser({
      uid: 'userId',
      firstName: 'Unit',
      lastName: 'Tester',
      email: 'userId@myorg.org',
      phoneNumber: '012345',
      position: 'Sr.Tester',
      orgId: 'O001',
      avatar: null,
      privacyPolicy: null
    })

    const mock = jest.spyOn(service, 'add');

    const requestOutput = service.request('O002', requestBy);
    await requestOutput.to('attendEvent', 'E001');
    expect(service.add).toHaveBeenCalled();
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
