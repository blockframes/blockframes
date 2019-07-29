import { Injectable } from '@angular/core';
import { FireQuery, Query } from '@blockframes/utils';
import { switchMap, tap, filter } from 'rxjs/operators';
import { InvitationStore } from './invitation.store';
import { AuthQuery, AuthService } from '@blockframes/auth';
import {
  Invitation,
  createInvitationToJoinOrganization,
  createInvitationToOrganization
} from './invitation.model';
import { Organization } from '@blockframes/organization';

@Injectable({
  providedIn: 'root'
})
export class InvitationService {
  constructor(
    private authQuery: AuthQuery,
    private store: InvitationStore,
    private db: FireQuery,
    private authService: AuthService
  ) {}

  /** Create an invitation for user asks to join an organization */
  public sendInvitationToOrg(organization: Partial<Organization>): Promise<void> {
    const userId = this.authQuery.userId;
    const invitation = createInvitationToJoinOrganization({
      id: this.db.createId(),
      organizationId: organization.id,
      userId
    });
    return this.db.doc<Invitation>(`invitations/${invitation.id}`).set(invitation);
  }

  /** Create an invitation for an organization asks user to join it */
  public async sendInvitationToUser(userEmail: string, organizationId: string): Promise<void> {
    // Get a user or create a ghost user when needed
    const { uid } = await this.authService.getOrCreateUserByMail(userEmail);
    const invitation = createInvitationToOrganization({
      id: this.db.createId(),
      organizationId: organizationId,
      userId: uid
    });
    return this.db.doc<Invitation>(`invitations/${invitation.id}`).set(invitation);
  }

  // TODO : move this in /layout guard => ISSUE#641
  public get organizationInvitations$() {
    return this.authQuery.user$.pipe(
      filter(user => !!user),
      switchMap(user => this.db.fromQuery(this.getInvitationsByOrgId(user.orgId))),
      tap((invitations: Invitation[]) => this.store.set(invitations))
    );
  }

  // TODO : move this in /layout guard => ISSUE#641
  private getInvitationsByOrgId(organizationId: string): Query<Invitation[]> {
    return {
      path: `invitations`,
      queryFn: ref =>
        ref.where('organizationId', '==', organizationId).where('state', '==', 'pending'),
      user: (invitation: Invitation) => ({
        // TODO: use profiles collections instead of users, issue#693
        path: `users/${invitation.userId}`
      })
    };
  }

  public acceptInvitation(invitationId: string) {
    return this.db.doc<Invitation>(`invitations/${invitationId}`).update({ state: 'accepted' });
  }

  public declineInvitation(invitationId: string) {
    return this.db.doc<Invitation>(`invitations/${invitationId}`).update({ state: 'declined' });
  }
}
