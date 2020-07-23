import { Injectable } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { CollectionConfig, CollectionService, AtomicWrite } from 'akita-ng-fire';
import { OrganizationQuery, createPublicOrganization, OrganizationService, Organization } from '@blockframes/organization/+state';
import { AuthQuery, User } from '@blockframes/auth/+state';
import { createPublicUser } from '@blockframes/user/+state';
import { toDate } from '@blockframes/utils/helpers';
import { InvitationState, InvitationStore } from './invitation.store';
import { Invitation, createInvitation } from './invitation.model';
import { InvitationDocument } from './invitation.firestore';
import { cleanInvitation } from '../invitation-utils';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { getCurrentApp } from '@blockframes/utils/apps';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'invitations' })
export class InvitationService extends CollectionService<InvitationState> {
  constructor(
    store: InvitationStore,
    private authQuery: AuthQuery,
    private orgQuery: OrganizationQuery,
    private orgService: OrganizationService,
    private functions: AngularFireFunctions,
    private routerQuery: RouterQuery
  ) {
    super(store);
  }

  formatFromFirestore(_invitation: InvitationDocument): Invitation {
    const invitation = {
      ..._invitation,
      date: toDate(_invitation.date)
    }
    return invitation;
  }

  formatToFirestore(invitation: Invitation): Invitation {
    return cleanInvitation(invitation);
  }

  /////////////
  // QUERIES //
  /////////////

  /** Accept an Invitation and change its status to accepted. */
  public acceptInvitation(invitation: Invitation) {
    // @TODO (#2500) should be handled by a backend function to prevent ugly rules
    return this.update({ ...invitation, status: 'accepted' });
  }

  /** Decline an Invitation and change its status to declined. */
  public declineInvitation(invitation: Invitation) {
    // @TODO (#2500) should be handled by a backend function to prevent ugly rules
    return this.update({ ...invitation, status: 'declined' });
  }

  /** Return true if there is already a pending invitation for a list of users */
  public async orgInvitationExists(userEmails: string[]): Promise<boolean> {
    const orgId = this.authQuery.orgId;
    const orgInvitations = await this.getValue(ref => ref.where('mode', '==', 'invitation')
      .where('type', '==', 'joinOrganization')
      .where('fromOrg.id', '==', orgId));

    return orgInvitations.some(
      invitation => userEmails.includes(invitation.toUser.email) && invitation.status === 'pending'
    );
  }

  public isInvitationForMe(invitation: Invitation): boolean {
    return invitation.toOrg?.id === this.authQuery.orgId || invitation.toUser?.uid === this.authQuery.userId
  }

  /**
   * Create an invitation with mode "request"
   * @param who Destination type
   */
  request(who: 'user' | 'org', id: string) {
    return {
      from: (fromType: 'user' | 'org', from?: User | Organization) => ({
        to: async (type: 'attendEvent' | 'joinOrganization', docId: string, write?: AtomicWrite) => {
          const base = { mode: 'request', type, docId } as Partial<Invitation>
          if (who === 'user') {
            base['toUser'] = createPublicUser({ uid: id });
          } else if (who === 'org') {
            base['toOrg'] = createPublicOrganization({ id });
          }
          if (fromType === 'user') {
            base['fromUser'] = createPublicUser(from || this.authQuery.user);
          } else if (fromType === 'org') {
            base['fromOrg'] = createPublicOrganization(from || this.orgQuery.getActive());
          }
          const invitation = createInvitation(base);
          await this.add(invitation, { write });
        }
      })
    }
  }

  /**
   * Create an invitation with mode "invitation"
   * @param who Destination type
   * @param idOrEmails "emails" for user, "ids" for org
   */
  invite(who: 'user' | 'org', idOrEmails: string | string[]) {
    return {
      from: (fromType: 'user' | 'org', from?: User | Organization) => ({
        to: (type: 'attendEvent' | 'joinOrganization', docId: string, write?: AtomicWrite) => {
          const base = { mode: 'invitation', type, docId } as Partial<Invitation>
          if (fromType === 'user') {
            base['fromUser'] = createPublicUser(from || this.authQuery.user);
          } else if (fromType === 'org') {
            base['fromOrg'] = createPublicOrganization(from || this.orgQuery.getActive());
          }
          const recipients = Array.isArray(idOrEmails) ? idOrEmails : [idOrEmails];
          // We use mergeMap to keep all subscriptions in memory (switchMap unsubscribe automatically)
          if (who === 'org') {
            return this.orgService.getValue(recipients)
              .then(orgs => orgs.map(toOrg => createInvitation({ ...base, toOrg: createPublicOrganization(toOrg) })))
              .then(invitations => this.add(invitations, { write }));
          } else if (who === 'user') {
            const f = this.functions.httpsCallable('inviteUsers');
            const app = getCurrentApp(this.routerQuery);
            return f({ emails: recipients, invitation: base, app }).toPromise();
          }
        }
      })
    }
  }
}
