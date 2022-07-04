import { AccessibilityTypes, EventTypes } from './static';
import { CalendarEvent } from 'angular-calendar';
import { Organization } from './organisation';
import { Movie } from './movie';
import { User } from './user';
import { StorageFile } from './media';
import { AnonymousCredentials, Person } from './identity';

// Event types
export type EventMeta = Meeting | Screening | Slate | unknown;

export type AttendeeStatus = 'owner' | 'requesting' | 'accepted' | 'denied' | 'ended';
export interface MeetingAttendee extends Person {
  uid: string,
  status: AttendeeStatus,
}

export interface ScreeningAttendee extends Person { //TODO : #7555
  uid: string;
  email: string;
  status: 'attended'; //TODO: #7555 may be used later (attending status in screenings statistics for exemple)
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
  attendees: Record<string, ScreeningAttendee>;
}

// This variable define the duration (in seconds) of a video link before it expires
export const linkDuration = 60 * 60 * 5; // 5 hours in seconds = 60 seconds * 60 minutes * 5 = 18 000 seconds

// Event
export interface Event<Meta extends EventMeta = unknown> extends CalendarEvent<Meta> {
  id: string;
  ownerOrgId: string;
  accessibility: AccessibilityTypes;
  isSecret: boolean;
  type: EventTypes;
  title: string;
  start: Date;
  isOwner: boolean;
  allDay: boolean;
  end: Date;
  meta: Meta;

  // We need that to avoid type error in template
  org?: Organization;
  movie?: Movie;
  organizedBy?: User;
}

export interface IcsEvent {
  id: string,
  title: string,
  start: Date,
  end: Date,
  description: string,
  organizer: {
    name: string,
    email: string
  }
}

export function createEvent<Meta extends EventMeta>(
  params: Partial<Event<Meta>> = {}
): Event<Meta> {
  const meta: EventMeta = isMeeting(params as Event)
    ? createMeeting(params.meta)
    : isScreening(params as Event)
      ? createScreening(params.meta)
      : isSlate(params as Event)
        ? createSlate(params.meta)
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
    start: params.start || new Date(),
    end: params.end || new Date(),
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
    attendees: {},
    ...screening,
  };
}

export interface Slate {
  description: string;
  organizerUid: string;
  titleIds: string[],
  videoId: string
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
    titleIds: [],
    videoId: '',
    ...slate
  }
}

// Calendar Event
export function createCalendarEvent(
  event: Partial<Event>,
  isOwner: boolean
): Event {
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

export function createScreeningAttendee(user: User | AnonymousCredentials): ScreeningAttendee {
  return {
    uid: user.uid,
    email: user.email,
    status: 'attended'
  };
}

export function hasMedia(event: Event<Screening | Slate>) {
  const hasScreener = isScreening(event) && event.meta.titleId;
  const hasSlate = isSlate(event) && event.meta.videoId;
  return hasScreener || hasSlate;
}
