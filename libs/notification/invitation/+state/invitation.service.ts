import { Injectable } from '@angular/core';
import { FireQuery, Query } from '@blockframes/utils';
import { switchMap, tap, filter } from 'rxjs/operators';
import { InvitationStore } from './invitation.store';
import { AuthQuery } from '@blockframes/auth';
import { Invitation } from './invitation.model';
import { Stakeholder } from '@blockframes/movie';

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

  public joinTeamwork(stakeholderId: string, id: string, type: string) {
    const collectionName = (type === 'delivery') ? 'deliveries' : 'movies';
    return this.db
      .doc<Stakeholder>(`${collectionName}/${id}/stakeholders/${stakeholderId}`)
      .update({ isAccepted: true })
      .then(() => {
        if (collectionName === 'movies') { // @todo move this to a function
          return this.addMovieToOrg(stakeholderId, collectionName, id);
        }
      })
  }

  private addMovieToOrg(stakeholderId: string, collectionName: string, movieId: string) {
    return this.db
      .doc<Stakeholder>(`${collectionName}/${movieId}/stakeholders/${stakeholderId}`).get().toPromise()
      .then(sh => sh.data().orgId)
      .then( orgId => this.db.collection('orgs').doc(orgId).get().toPromise())
      .then( org => {
        const movieIds = org.data().movieIds || [];
        if( !movieIds.includes(movieId) ) {
          return org.ref.update({ movieIds : [...movieIds, movieId] });
        }
      })
  }
}
