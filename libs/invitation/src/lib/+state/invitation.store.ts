import { EntityState, EntityStore, ActiveState, StoreConfig } from '@datorama/akita';
import { Injectable } from "@angular/core";
import { Invitation } from './invitation.model';

export interface InvitationState extends EntityState<Invitation>, ActiveState<string> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'invitations' })
export class InvitationStore extends EntityStore<InvitationState> {
  constructor() {
    super();
  }
}
