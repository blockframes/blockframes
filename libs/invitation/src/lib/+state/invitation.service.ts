import { Injectable } from '@angular/core';
import { where } from 'firebase/firestore';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { AuthService } from '@blockframes/auth/service';
import {
  createPublicUser,
  PublicUser,
  User,
  createPublicOrganization,
  Organization,
  createInvitation,
  Invitation,
  InvitationStatus,
  AlgoliaOrganization,
  App,
  getOrgAppAccess,
  filterInvitation
} from '@blockframes/model';
import { combineLatest, Observable, of } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { PermissionsService } from '@blockframes/permissions/+state/permissions.service';
import { subMonths } from 'date-fns';
import { AtomicWrite, CallableFunctions } from 'ngfire';
import { BlockframesCollection } from '@blockframes/utils/abstract-service';

@Injectable({ providedIn: 'root' })
export class InvitationService extends BlockframesCollection<Invitation> {
  readonly path = 'invitations';

  /** All Invitations related to current user or org */
  allInvitations$: Observable<Invitation[]> = combineLatest([
    this.authService.profile$,
    this.permissionsService.isAdmin$
  ]).pipe(
    switchMap(([user, isAdmin]) => {
      if (!user?.uid || !user?.orgId) return of([]);
      if (isAdmin) {
        return combineLatest([
          // Invitations linked to current user
          this.valueChanges([where('fromUser.uid', '==', user.uid)]),
          this.valueChanges([where('toUser.uid', '==', user.uid)]),

          // Invitations linked to current org
          this.valueChanges([where('fromOrg.id', '==', user.orgId)]),
          this.valueChanges([where('toOrg.id', '==', user.orgId)]),
        ])
      } else {
        return combineLatest([
          // Invitations linked to current user
          this.valueChanges([where('fromUser.uid', '==', user.uid)]),
          this.valueChanges([where('toUser.uid', '==', user.uid)]),

          // Event invitations linked to current org
          this.valueChanges([where('type', '==', 'attendEvent'), where('fromOrg.id', '==', user.orgId)]),
          this.valueChanges([where('type', '==', 'attendEvent'), where('toOrg.id', '==', user.orgId)]),
        ])
      }
    }),
    map(i => i.flat()),
    map(invitations => invitations.filter((i, index) => invitations.findIndex(elm => elm.id === i.id) === index)),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );

  /** Invitations to current user or org */
  myInvitations$ = combineLatest([
    this.authService.profile$,
    this.allInvitations$
  ]).pipe(
    map(([user, invitations]) => {
      if (!user?.uid || !user?.orgId) return [];
      return invitations
        .filter(i => i.toOrg?.id === user.orgId || i.toUser?.uid === user.uid)
        .filter(i => filterInvitation(i, this.app));
    })
  );

  /** Invitations where current user is a guest */
  guestInvitations$ = combineLatest([
    this.authService.profile$,
    this.allInvitations$
  ]).pipe(
    map(([user, invitations]) => {
      if (!user?.uid || !user?.orgId) return [];
      const request = (user: User, invitation: Invitation) => invitation.fromUser?.uid === user.uid && invitation.mode === 'request';
      const invitation = (user: User, invitation: Invitation) => invitation.toUser?.uid === user.uid && invitation.mode === 'invitation';
      return invitations.filter(i => request(user, i) || invitation(user, i))
    })
  );

  /**
   * Return true if there is already a pending invitation for a list of users
   */
  hasUserAnOrgOrIsAlreadyInvited = this.functions.prepare<string[], boolean>('hasUserAnOrgOrIsAlreadyInvited');

  /**
   * Return a boolean or a PublicOrganization doc if there is an invitation linked to the email.
   * Return false if there is no invitation at all.
   */
  getInvitationLinkedToEmail = this.functions.prepare<string, boolean | AlgoliaOrganization>('getInvitationLinkedToEmail');

  /**
   * Used to accept or decline invitation if user is logged in as anonymous
   */
  acceptOrDeclineInvitationAsAnonymous = this.functions.prepare<{ invitationId: string, email: string, status: InvitationStatus }, unknown>('acceptOrDeclineInvitationAsAnonymous');

  constructor(
    private orgService: OrganizationService,
    private authService: AuthService,
    private permissionsService: PermissionsService,
    private functions: CallableFunctions
  ) {
    super();
  }

  toFirestore(invitation: Invitation) {
    delete invitation.message;
    return invitation;
  }

  /////////////
  // QUERIES //
  /////////////

  /** Accept an Invitation and change its status to accepted. */
  public acceptInvitation(invitation: Invitation) {
    return this.update({ ...invitation, status: 'accepted' });
  }

  /** Decline an Invitation and change its status to declined. */
  public declineInvitation(invitation: Invitation) {
    return this.update({ ...invitation, status: 'declined' });
  }

  /**
   * Create an invitation with mode "request"
   * @param orgId The org the request is made to
   */
  request(orgId: string, fromUser: User | PublicUser = this.authService.profile) {
    return {
      to: async (type: 'attendEvent' | 'joinOrganization', eventId?: string, write?: AtomicWrite) => {
        const request = { mode: 'request', type } as Partial<Invitation>;
        if (type === 'attendEvent') {
          request.eventId = eventId;
        }

        request.toOrg = createPublicOrganization({ id: orgId });

        request.fromUser = createPublicUser(fromUser);
        const invitation = createInvitation(request);
        await this.add(invitation, { write });
      }
    }
  }

  /**
   * Create an invitation with mode "invitation"
   * @param idOrEmails "emails" for user, "ids" for org
   */
  invite(idOrEmails: string | string[], fromOrg: Organization = this.orgService.org) {
    return {
      to: (type: 'attendEvent' | 'joinOrganization', eventId?: string) => {
        const invitation = { mode: 'invitation', type } as Partial<Invitation>;
        if (type === 'attendEvent') {
          invitation.eventId = eventId;
        }
        invitation.fromOrg = createPublicOrganization(fromOrg);
        const recipients = Array.isArray(idOrEmails) ? idOrEmails : [idOrEmails];

        let app = this.app;
        if (app === 'crm') {
          // Instead use first found app where org has access to
          app = getOrgAppAccess(fromOrg)[0];
        }
        return this.functions.call<{ emails: string[], invitation: Partial<Invitation>, app: App }, unknown>('inviteUsers', { emails: recipients, invitation, app });
      }
    }
  }

  invitationCount({ onlyPending } = { onlyPending: true }) {
    const fourMonthsAgo = subMonths(new Date(), 4);
    // Filtering out invitations older than 4 months because there is no timeFrame supporting them in invitation-list component.
    const lastFourMonths = (invitation: Invitation) => invitation.date > fourMonthsAgo;
    return this.myInvitations$.pipe(
      map(invitations => invitations.filter(lastFourMonths)),
      map(invitations => invitations.filter(invitation => onlyPending ? invitation.status === 'pending' : true)),
      map(invitations => invitations.length)
    )
  }
}
