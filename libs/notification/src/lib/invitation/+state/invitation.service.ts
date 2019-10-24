import { Injectable } from '@angular/core';
import { snapshot, FireQuery } from '@blockframes/utils';
import { InvitationState } from './invitation.store';
import { AuthQuery, AuthService } from '@blockframes/auth';
import { createInvitationToDocument, createInvitationFromUserToOrganization, createInvitationFromOrganizationToUser } from './invitation.model';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { Organization, PublicOrganization } from '@blockframes/organization';
import { Invitation, InvitationStatus } from './invitation.firestore';
import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { Query } from '@blockframes/utils';

export const invitationQuery = (uid: string): Query<Invitation[]> => ({
  path: `invitations`,
  queryFn: ref => ref.where('user.uid', '==', uid )
});

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'invitations' })
export class InvitationService extends CollectionService<InvitationState> {
  private invitations$: Observable<Invitation[]>;

  constructor(private authQuery: AuthQuery, private authService: AuthService, public db: FireQuery,) {
    super();
  }

  public syncUserInvitations(): Observable<Invitation[]> {
    // Prevent creating multiple side-effecting subs
    if (this.invitations$) {
      return this.invitations$;
    }

    return this.invitations$ = this.authQuery.user$.pipe(
      switchMap(user => {
        return this.db.fromQuery<Invitation[]>(invitationQuery(user.uid));
      }),
    );
  }

  /** Create an Invitation when a user asks to join an Organization. */
  public async sendInvitationToOrg(organizationId: string): Promise<void> {
    const organization = await snapshot<Organization>(`orgs/${organizationId}`);
    const { uid, avatar, name, surname, email } = this.authQuery.getValue().user;
    const invitation = createInvitationFromUserToOrganization({
      id: this.db.createId(),
      organization: {id: organization.id, name: organization.name},
      user: { uid, avatar, name, surname, email }
    });
    return this.add(invitation);
  }

  /** Create an Invitation when an Organization asks a user to join it. */
  public async sendInvitationToUser(userEmail: string, organizationId: string): Promise<void> {
    // Get a user or create a ghost user when needed
    const { uid, email } = await this.authService.getOrCreateUserByMail(userEmail);
    const organization = await snapshot<Organization>(`orgs/${organizationId}`);
    const invitation = createInvitationFromOrganizationToUser({
      id: this.db.createId(),
      organization: {id: organization.id, name: organization.name},
      user: { uid, email }
    });
    return this.add(invitation);
  }

  /** Create an Invitation when an Organization is invited to work on a document. */
  public sendDocumentInvitationToOrg({id, name}: PublicOrganization, docId: string): Promise<void> {
    const invitation = createInvitationToDocument({
      id: this.db.createId(),
      organization: {id, name},
      docId
    });
    return this.add(invitation);
  }

  /** Accept an Invitation and change its status to accepted. */
  public acceptInvitation(invitation: Invitation) {
    return this.update({...invitation, status: InvitationStatus.accepted});
  }

  /** Decline an Invitation and change its status to declined. */
  public declineInvitation(invitation: Invitation) {
    return this.update({...invitation, status: InvitationStatus.declined});
  }
}
