import type firestore from 'firebase/firestore';
import { StorageFile } from '@blockframes/media/+state/media.firestore';
import { AccessibilityTypes } from '@blockframes/utils/static-model/types';
import { Person } from '@blockframes/utils/common-interfaces/identity';
import { toDate } from '@blockframes/utils/helpers';
import { Movie, Organization, User } from '@blockframes/model';
import { CalendarEvent } from 'angular-calendar';
import { AnonymousCredentials } from '@blockframes/auth/+state/auth.model';

type Timestamp = firestore.Timestamp;

// Event types
export type EventTypes = 'standard' | 'meeting' | 'screening' | 'local';
export type EventMeta = Meeting | Screening | unknown;

export type AttendeeStatus = 'owner' | 'requesting' | 'accepted' | 'denied' | 'ended';
export interface MeetingAttendee extends Person {
  uid: string,
  status: AttendeeStatus,
}

export interface Meeting {
  organizerUid: string;
  description: string;
  attendees: Record<string, MeetingAttendee>;
  files: StorageFile[];
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
  organizerUid: string;
}

export interface EventBase<D extends Timestamp | Date, Meta extends EventMeta = Record<string, unknown>> {
  id: string;
  ownerOrgId: string;
  accessibility: AccessibilityTypes;
  isSecret: boolean;
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

// This variable define the duration (in seconds) of a video link before it expires
export const linkDuration = 60 * 60 * 5; // 5 hours in seconds = 60 seconds * 60 minutes * 5 = 18 000 seconds

// Event
export interface Event<Meta extends EventMeta = unknown>
  extends EventBase<Date, Meta>,
  CalendarEvent<Meta> {
  id: string;
  isOwner: boolean;
  allDay: boolean;
  end: Date;
  meta: Meta;

  // We need that to avoid type error in template
  org?: Organization;
  movie?: Movie;
  organizedBy?: User;
}

export function createEvent<Meta extends EventMeta>(
  params: Partial<EventBase<Date | Timestamp, Meta>> = {}
): Event<Meta> {
  const meta: EventMeta = isMeeting(params as Event)
    ? createMeeting(params.meta)
    : isScreening(params as Event)
      ? createScreening(params.meta)
      : {};

  return {
    id: '',
    title: '',
    ownerOrgId: '',
    accessibility: 'private',
    isSecret: false,
    type: 'standard',
    allDay: false,
    isOwner: false,
    ...params,
    start: toDate(params.start || new Date()),
    end: toDate(params.end || new Date()),
    meta: meta as Meta,
  };
}

// Meeting
export interface MeetingEvent extends Event<Meeting> {
  type: 'meeting';
  org: Organization;
  organizedBy: User;
}
export const isMeeting = (event: Partial<Event>): event is MeetingEvent => event?.type === 'meeting';

export function createMeeting(meeting: Partial<Meeting>): Meeting {
  return {
    organizerUid: '',
    description: '',
    attendees: {},
    files: [],
    selectedFile: '',
    controls: {},

    ...meeting,
  };
}

// Screening
export interface ScreeningEvent extends Event<Screening> {
  type: 'screening';
  movie: Movie;
  org: Organization;
}

export const isScreening = (event: Partial<Event>): event is ScreeningEvent => event?.type === 'screening';

export function createScreening(screening: Partial<Screening>): Screening {
  return {
    titleId: '',
    description: '',
    organizerUid: '',
    ...screening,
  };
}

// Calendar Event
export function createCalendarEvent<M>(
  event: Partial<EventBase<Date | Timestamp, M>>,
  isOwner: boolean
): Event<M> {
  return {
    ...createEvent(event),
    isOwner,
    draggable: isOwner,
    resizable: { beforeStart: isOwner, afterEnd: isOwner },
  };
}

export function createMeetingAttendee(
  user: User | AnonymousCredentials,
  status: AttendeeStatus = 'requesting'
): MeetingAttendee {
  return {
    uid: user.uid,
    firstName: user.firstName,
    lastName: user.lastName,
    status,
  };
}
