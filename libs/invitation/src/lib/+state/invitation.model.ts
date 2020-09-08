import { InvitationBase } from './invitation.firestore';
import { Organization } from '@blockframes/organization/+state/organization.model';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { EventTypes } from '@blockframes/event/+state/event.firestore';

export { InvitationStatus, createInvitation } from './invitation.firestore';

export type Invitation = InvitationBase<Date>;

export interface InvitationDetailed extends Invitation {
    org: Organization,
    guestOrg?: Organization,
    eventTitle: string
    eventId: string
    eventStart: Date,
    eventEnd: Date,
    eventType: EventTypes,
    eventIsPrivate: boolean,
    guestEmail: string,
    guestFirstName: string,
    guestLastName: string,
    movie?: Movie,
  };
