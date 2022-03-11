import { InvitationBase } from './invitation.firestore';
import { Event, Organization, PublicUser, Movie } from '@blockframes/model';

export { InvitationStatus, createInvitation } from './invitation.firestore';

export type Invitation = InvitationBase<Date>;

export interface InvitationDetailed extends Invitation {
  org: Organization;
  guestOrg?: Organization;
  event: Event;
  guest?: PublicUser;
  movie?: Movie;
}
