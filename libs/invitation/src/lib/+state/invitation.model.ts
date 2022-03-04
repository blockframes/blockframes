import { InvitationBase } from './invitation.firestore';
import { Organization } from '@blockframes/organization/+state/organization.model';
import { PublicUser } from '@blockframes/user/+state/user.model';
import { Movie } from '@blockframes/data-model';
import { Event } from '@blockframes/event/+state/event.model';

export { InvitationStatus, createInvitation } from './invitation.firestore';

export type Invitation = InvitationBase<Date>;

export interface InvitationDetailed extends Invitation {
  org: Organization,
  guestOrg?: Organization,
  event: Event,
  guest?: PublicUser,
  movie?: Movie,
};
