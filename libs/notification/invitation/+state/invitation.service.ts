import { Injectable } from '@angular/core';
import { FireQuery, Query } from '@blockframes/utils';
import { catchError, filter, switchMap, tap } from 'rxjs/operators';
import { InvitationStore } from './invitation.store';
import { AuthQuery, AuthService } from '@blockframes/auth';
import {
  createInvitationToJoinOrganization,
  createInvitationToOrganization,
  Invitation,
  createInvitationToDocument
} from './invitation.model';
import { of } from 'rxjs';

export function getInvitationsByOrgId(organizationId: string): Query<Invitation[]> {
  return {
    path: `invitations`,
    queryFn: ref =>
      ref.where('organizationId', '==', organizationId).where('state', '==', 'pending'),
    user: (invitation: Invitation) => ({
      // TODO: use profiles collections instead of users, issue#693
      // TODO(issue#740): when we create an invitation, the userDoc doesn't exist directly, so the doc is not found
      path: `users/${invitation.userId}`
    })
  };
}

export function getInvitationsByUserId(userId: string): Query<Invitation[]> {
  return {
    path: `invitations`,
    queryFn: ref => ref.where('userId', '==', userId).where('state', '==', 'pending'),
    organization: (invitation: Invitation) => ({
      // TODO: use profiles collections instead of users, issue#693
      // TODO: when we create an invitation, the userDoc doesn't exist directly, so the doc is not found
      path: `orgs/${invitation.organizationId}`
    })
  };
}

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

  // TODO : move this in /layout guard => ISSUE#641
  public get organizationInvitations$() {
    return this.authQuery.user$.pipe(
      filter(user => !!user),
      switchMap(user => this.db.fromQuery(getInvitationsByOrgId(user.orgId))),
      catchError(err => {
        console.error(err);
        return of([]);
      }),
      tap((invitations: Invitation[]) => this.store.set(invitations))
    );
  }

  // TODO : move this in /layout guard => ISSUE#641
  public get userInvitations$() {
    return this.authQuery.user$.pipe(
      filter(user => !!user),
      switchMap(user => this.db.fromQuery(getInvitationsByUserId(user.uid))),
      tap((invitations: Invitation[]) => this.store.set(invitations))
    );
  }

  /** Create an invitation when a user asks to join an organization */
  public sendInvitationToOrg(organizationId: string): Promise<void> {
    const userId = this.authQuery.userId;
    const invitation = createInvitationToJoinOrganization({
      id: this.db.createId(),
      organizationId: organizationId,
      userId
    });
    return this.db.doc<Invitation>(`invitations/${invitation.id}`).set(invitation);
  }

  /** Create an invitation when an organization asks a user to join it */
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

  /** Create an invitation when an organization is invited to work on a document */
  public sendDocInvitationToOrg(organizationId: string, docId: string): Promise<void> {
    const userId = this.authQuery.userId;
    const invitation = createInvitationToDocument({
      id: this.db.createId(),
      organizationId,
      docId,
      userId
    });
    return this.db.doc<Invitation>(`invitations/${invitation.id}`).set(invitation);
  }

  public acceptInvitation(invitationId: string) {
    return this.db.doc<Invitation>(`invitations/${invitationId}`).update({ state: 'accepted' });
  }

  public declineInvitation(invitationId: string) {
    return this.db.doc<Invitation>(`invitations/${invitationId}`).update({ state: 'declined' });
  }
}
