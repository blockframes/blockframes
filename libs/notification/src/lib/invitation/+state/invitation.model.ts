import { InvitationBase } from './invitation.firestore';
export { InvitationStatus } from './invitation.firestore';

export type Invitation = InvitationBase<Date>;

/** Create an Invitation */
export function createInvitation(params: Partial<Invitation> = {}): Invitation {
  return  {
    id: '',
    mode: null,
    type: null,
    docId: '',
    status: 'pending',
    date: new Date(),
    ...params,
  };
}

