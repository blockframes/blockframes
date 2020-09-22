import { firestore } from 'firebase/app';
import { AnalyticsEvents } from '@blockframes/utils/analytics/analyticsEvents';

type Timestamp = firestore.Timestamp;

// Event types
export type EventTypes = 'standard' | 'meeting' | 'screening' | 'local';
export type EventMeta = Meeting | Screening | {};

export interface Meeting {
  callUrl: string;
  organizerId: string;
  description: string;
  files: string[];
}

export interface Screening {
  /** A screening session can have one title */
  titleId: string;
}

export interface EventBase<D extends Timestamp | Date, Meta extends EventMeta = any> {
  id: string;
  /** @dev The id of the owner. Can be a user or an organization given the event.type **/
  ownerId: string;
  isPrivate: boolean;
  type: EventTypes;
  title: string;
  start: D;
  end: D;
  allDay: boolean,
  meta: Meta;
}

// firestore documents
export type EventDocument<Meta> = EventBase<Timestamp, Meta>;
export type MeetingEventDocument = EventDocument<Meeting>;
export type ScreeningEventDocument = EventDocument<Screening>;


export interface EventAnalytics {
  event_name: AnalyticsEvents,
  hits: number,
  eventIdPage: string,
  userId: string,
  eventId: string,
  email: string,
  firstName: string,
  lastName: string
}

export interface EventsAnalytics {
  eventId: string,
  eventUsers: EventAnalytics[]
}

// This variable define the duration (in seconds) of a video link before it expires
export const linkDuration = 60 * 60 * 5; // 5 hours in seconds = 60 seconds * 60 minutes * 5 = 18 000 seconds
