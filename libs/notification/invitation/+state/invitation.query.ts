import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { Invitation } from './invitation.model';
import { InvitationStore, InvitationState } from './invitation.store';

@Injectable({
  providedIn: 'root'
})
export class InvitationQuery extends QueryEntity<InvitationState, Invitation> {


  constructor(
    protected store: InvitationStore,
  ) {
    super(store);
  }

}
