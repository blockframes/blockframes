import { Injectable } from '@angular/core';
import { FireQuery, Query } from '@blockframes/utils';
import { switchMap, tap, filter } from 'rxjs/operators';
import { InvitationStore } from './invitation.store';
import { AuthQuery } from '@blockframes/auth';
import { Invitation, createInvitation } from './invitation.model';
import { Organization } from '@blockframes/organization';

@Injectable({
  providedIn: 'root'
})
export class InvitationService {
  constructor(
    private authQuery: AuthQuery,
    private store: InvitationStore,
    private db: FireQuery
  ) {}

  /** Create an invitation for user asks to join an organization */
  public sendInvitationToOrg(organization: Partial<Organization>): Promise<void> {
    const user = this.authQuery.user;
    const message = `${user.name} ${user.surname} would like to participate to your organization`;
    const invitation = createInvitation({
      id: this.db.createId(),
      message,
      orgId: organization.id,
      user
    });
    return this.db.doc<Invitation>(`invitations/${invitation.id}`).set(invitation);
  }

  // TODO : move this in /layout guard => ISSUE#641
  public get userInvitations$() {
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
      queryFn: ref => ref.where('organizationId', '==', organizationId)
    };
  }

  public acceptInvitation(invitationId: string) {
    return this.db.doc<Invitation>(`invitations/${invitationId}`).update({ state: 'accepted' });
  }
}
