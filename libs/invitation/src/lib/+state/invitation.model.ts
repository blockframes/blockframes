import { InvitationBase } from './invitation.firestore';
import { Organization, PublicUser, Movie } from '@blockframes/model';
import { Event } from '@blockframes/event/+state/event.model';

export { InvitationStatus, createInvitation } from './invitation.firestore';

export type Invitation = InvitationBase<Date>;

export interface InvitationDetailed extends Invitation {
  org: Organization;
  guestOrg?: Organization;
  event: Event;
  guest?: PublicUser;
  movie?: Movie;
}
