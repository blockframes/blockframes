import { EntityState, EntityStore, StoreConfig, ActiveState } from '@datorama/akita';
import { Injectable } from '@angular/core';
import { Invitation } from './invitation.model';

export interface InvitationState extends EntityState<Invitation>, ActiveState<string> {}

const initialState = {
  active: null
};

@Injectable({
  providedIn: 'root'
})
@StoreConfig({ name: 'invitations' })
export class InvitationStore extends EntityStore<InvitationState, Invitation> {
  constructor() {
    super(initialState);
  }
}
