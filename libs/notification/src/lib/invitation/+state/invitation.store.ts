import { EntityState, EntityStore, ActiveState, guid } from '@datorama/akita';;
import { Invitation } from './invitation.model';

export interface InvitationState extends EntityState<Invitation>, ActiveState<string> {}

const initialState = {
  active: null
};

export class InvitationStore extends EntityStore<InvitationState> {
  constructor() {
    super(initialState, { name: `invitation-${guid()}` });
  }
}
