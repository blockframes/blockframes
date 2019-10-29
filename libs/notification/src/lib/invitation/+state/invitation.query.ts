import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { InvitationStore, InvitationState } from './invitation.store';

@Injectable()
export class InvitationQuery extends QueryEntity<InvitationState> {
  constructor(protected store: InvitationStore) {
    super(store);
  }
}
