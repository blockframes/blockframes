import { InvitationBase } from './invitation.firestore';
import { createPublicUser } from '@blockframes/user/+state/user.model';
import { createPublicOrganization } from '@blockframes/organization/+state/organization.model';

export { InvitationStatus } from './invitation.firestore';

export type Invitation = InvitationBase<Date>;

/** Create an Invitation */
export function createInvitation(params: Partial<Invitation> = {}): Invitation {
  const invitation = {
    id: '',
    mode: null,
    type: null,
    docId: '',
    status: 'pending',
    date: new Date(),
    ...params,
  };
  if (params.fromOrg) {
    invitation.fromOrg = createPublicOrganization(params.fromOrg);
  }
  if (params.fromUser) {
    invitation.fromUser = createPublicUser(params.fromUser);
  }
  if (params.toOrg) {
    invitation.toOrg = createPublicOrganization(params.toOrg);
  }
  if (params.toUser) {
    invitation.toUser = createPublicUser(params.toUser);
  }
  return invitation as Invitation;
}

