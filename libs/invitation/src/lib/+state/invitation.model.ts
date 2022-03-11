import { Organization, PublicUser, Movie, InvitationBase } from '@blockframes/model';
import { Event } from '@blockframes/event/+state/event.model';

export type Invitation = InvitationBase<Date>;

export interface InvitationDetailed extends Invitation {
  org: Organization;
  guestOrg?: Organization;
  event: Event;
  guest?: PublicUser;
  movie?: Movie;
}
