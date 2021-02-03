import type firebase from 'firebase';
import { AnalyticsEvents } from '@blockframes/utils/analytics/analytics-model';

type Timestamp = firebase.firestore.Timestamp;

// Event types
export type EventTypes = 'standard' | 'meeting' | 'screening' | 'local';
export type EventMeta = Meeting | Screening | {};

export type AttendeeStatus = 'owner' | 'requesting' | 'accepted' | 'denied' | 'ended';

export interface Meeting {
  organizerId: string;
  description: string;
  attendees: Record<string, AttendeeStatus>;
  files: string[];
  selectedFile: string;
  controls: Record<string, MeetingMediaControl>
}

export interface MeetingPdfControl {
  type: 'pdf';
  currentPage: number;
  totalPages: number;
}

export interface MeetingVideoControl {
  type: 'video';
  isPlaying: boolean;
  position: number;
  duration: number;
}

export type MeetingMediaControl = MeetingPdfControl | MeetingVideoControl;

/** Maximum number of invitations that can be sent for a given Meeting */
export const MEETING_MAX_INVITATIONS_NUMBER = 9;

export interface Screening {
  /** A screening session can have one title */
  titleId: string;
  description: string;
}

export interface EventBase<D extends Timestamp | Date, Meta extends EventMeta = any> {
  id: string;
  /** @dev The id of the owner. Can be a user or an organization given the event.type **/
  ownerId: string;
  privacy: 'public' | 'private' | 'secret';
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
  lastName: string,
  orgName?: string,
  orgActivity?: string,
  orgCountry?: string,
}

export interface EventsAnalytics {
  eventId: string,
  eventUsers: EventAnalytics[]
}

// This variable define the duration (in seconds) of a video link before it expires
export const linkDuration = 60 * 60 * 5; // 5 hours in seconds = 60 seconds * 60 minutes * 5 = 18 000 seconds
