import { firestore } from 'firebase/app';
import { InvitationStatus, InvitationDocument } from './invitation.firestore';
import { App } from '@blockframes/utils/static-model/staticModels';
import { ImgRef } from '@blockframes/utils/image-uploader';

export { InvitationStatus } from './invitation.firestore';

export interface Invitation extends InvitationDocument {
  message: string;
  imgRef?: ImgRef;
}

/** Factory function that create an Invitation of type toWorkOnDocument. */
export function createInvitation(params: Partial<InvitationDocument> = {}): InvitationDocument {
  return {
    id: params.id,
    app: params.app || App.main,
    type: params.type,
    status: InvitationStatus.pending,
    date: firestore.Timestamp.now(),
    ...params
  };
}

/** Cleans an organization of its optional parameters */
export function cleanInvitation(invitation: Invitation): InvitationDocument {
  const cleanInvit = { ...invitation };
  // Remove local values
  delete cleanInvit.message;
  delete cleanInvit.imgRef
  return cleanInvit;
}
