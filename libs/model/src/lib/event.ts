import { AccessibilityTypes } from '@blockframes/utils/static-model/types';
import { toDate } from '@blockframes/utils/helpers';
import { CalendarEvent } from 'angular-calendar';
import { AnonymousCredentials } from '@blockframes/auth/+state/auth.model';
import { Organization } from './organisation';
import { Movie } from './movie';
import { User } from './user';
import { StorageFile } from './media';
import { Person } from './identity';
import { Timestamp } from './timestamp';

// Event types
export type EventTypes = 'standard' | 'meeting' | 'screening' | 'local' | 'slate';
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
export type SlateEventDocument = EventDocument<Screening>;

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

export interface Slate { //to define
  description: string;
  organizerUid: string;
  titles: Array<any>,
  video: string
}
// Slate Presentation
export interface SlateEvent extends Event<Slate> {
  type: 'slate';
  movie: Movie;
  org: Organization;
}
export const isSlate = (event: Partial<Event>): event is SlateEvent => event?.type === 'slate';
export function createSlate(slate: Partial<Slate>): Slate {
  return {
    description: '',
    organizerUid: '',
    titles: [],
    video: '',
    ...slate
  }
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
