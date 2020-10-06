import { TestBed } from '@angular/core/testing';

import { MeetingService } from './meeting.service';
import {UserService, UserStore} from "@blockframes/user/+state";
import {AuthQuery, AuthStore} from "@blockframes/auth/+state";
import {OrganizationQuery, OrganizationStore} from "@blockframes/organization/+state";

describe('MeetingService', () => {
  let service: MeetingService;
  let userService: UserService;
  let userStore: UserStore;
  let authStore: AuthStore;
  let authQuery: AuthQuery;
  let organizationQuery: OrganizationQuery;
  let organizationStore: OrganizationStore;

  beforeEach(() => {

    organizationStore = new OrganizationStore();
    organizationQuery = new OrganizationQuery(organizationStore);
    authStore = new AuthStore();
    authQuery = new AuthQuery(authStore);
    userStore = new UserStore();
    userService = new UserService(userStore, authStore, authQuery, organizationQuery);
    service = new MeetingService(userService);
    TestBed.configureTestingModule({
      providers: [userService]
    });
    TestBed.inject(MeetingService)
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
