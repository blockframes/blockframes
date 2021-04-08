import { Injectable } from '@angular/core';
import { QueryEntity, QueryConfig, Order } from '@datorama/akita';
import { InvitationStore, InvitationState } from './invitation.store';
import { AuthQuery } from '@blockframes/auth/+state';

@Injectable({ providedIn: 'root' })
@QueryConfig({ sortBy: 'date', sortByOrder: Order.DESC })
export class InvitationQuery extends QueryEntity<InvitationState> {

  constructor(protected store: InvitationStore, private authQuery: AuthQuery) {
    super(store);
  }
}
