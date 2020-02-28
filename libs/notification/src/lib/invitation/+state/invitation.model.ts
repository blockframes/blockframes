import { firestore } from 'firebase/app';
import { InvitationStatus, InvitationDocument } from './invitation.firestore';

export { InvitationStatus } from './invitation.firestore';
export { InvitationDocument as Invitation } from './invitation.firestore';


/** Factory function that create an Invitation of type toWorkOnDocument. */
export function createInvitation(params: Partial<InvitationDocument> = {}): InvitationDocument {
  return {
    id: params.id,
    app: params.app,
    type: params.type,
    status: InvitationStatus.pending,
    date: firestore.Timestamp.now(),
    ...params
  };
}
