import { EntityState, EntityStore, ActiveState, guid } from '@datorama/akita';
import { Invitation } from './invitation.firestore';
import { Injectable } from "@angular/core";

export interface InvitationState extends EntityState<Invitation>, ActiveState<string> {}

const initialState = {
  active: null
};

@Injectable()
export class InvitationStore extends EntityStore<InvitationState> {
  constructor() {
    super(initialState, { name: `invitation-${guid()}` });
  }
}
