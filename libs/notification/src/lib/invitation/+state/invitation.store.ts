import { EntityState, EntityStore, ActiveState, guid, StoreConfig } from '@datorama/akita';
import { Invitation } from './invitation.firestore';
import { Injectable } from '@angular/core';
import { CollectionConfig } from 'akita-ng-fire';

export interface InvitationState extends EntityState<Invitation>, ActiveState<string> {}

const initialState = {
  active: null
};

@Injectable({ providedIn: 'root' })
export class InvitationStore extends EntityStore<InvitationState> {
  constructor() {
    super(initialState, { name: `invitation-${guid()}` });
  }
}
