import { EntityState, EntityStore, ActiveState, guid } from '@datorama/akita';
import { Injectable } from "@angular/core";
import { Invitation } from './invitation.model';

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
