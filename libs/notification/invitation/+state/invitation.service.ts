import { Injectable } from '@angular/core';
import { FireQuery, Query } from '@blockframes/utils';
import { switchMap, tap, filter } from 'rxjs/operators';
import { InvitationStore } from './invitation.store';
import { AuthQuery } from '@blockframes/auth';
import { Invitation } from './invitation.model';

@Injectable({
  providedIn: 'root'
})
export class InvitationService {
  constructor(
    private authQuery: AuthQuery,
    private store: InvitationStore,
    private db: FireQuery
  ) {}

  // TODO : move this in /layout guard
  public get userInvitations() {
    return this.authQuery.user$.pipe(
      filter(user => !!user),
      switchMap(user => this.db.fromQuery(this.getInvitationByUserId(user.uid))),
      tap((invitations: any) => this.store.set(invitations)) // TODO : Find a way to cast invitations as Invitation[];
    );
  }

  // TODO : move this in /layout guard
  private getInvitationByUserId(userId: string): Query<Invitation> {
    return {
      path: `invitations`,
      queryFn: ref => ref.where('userId', '==', userId)
    };
  }

  public acceptInvitation(invitationId: string) {
    return this.db.doc<Invitation>(`invitations/${invitationId}`).update({ state: 'accepted' });
  }

}
