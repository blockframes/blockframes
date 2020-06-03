import { InvitationBase } from './invitation.firestore';
export { InvitationStatus, createInvitation } from './invitation.firestore';

export type Invitation = InvitationBase<Date>;
