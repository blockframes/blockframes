import { CalendarEvent } from 'angular-calendar';
import { Meeting, EventBase, Screening, EventMeta, MeetingAttendee, AttendeeStatus } from './event.firestore';
import { toDate } from '@blockframes/utils/helpers';
import { Movie } from '@blockframes/data-model';
import { Organization } from '@blockframes/organization/+state';
import type firebase from 'firebase';
import { AnonymousCredentials } from '@blockframes/auth/+state/auth.model';
import { User } from '@blockframes/user/+state/user.model';
type Timestamp = firebase.firestore.Timestamp;

// Event
export interface Event<Meta extends EventMeta = unknown> extends EventBase<Date, Meta>, CalendarEvent<Meta> {
  id: string;
  isOwner: boolean;
  allDay: boolean;
  end: Date;
  meta: Meta;

  // We need that to avoid type error in template
  org?: Organization;
  movie?: Movie;
  organizedBy?: User,
}
export function createEvent<Meta extends EventMeta>(params: Partial<EventBase<Date | Timestamp, Meta>> = {}): Event<Meta> {
  const meta: EventMeta =
    isMeeting(params as Event) ? createMeeting(params.meta)
    : isScreening(params as Event) ? createScreening(params.meta)
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
    meta: meta as Meta
  };
}

// Local
export interface LocalEvent extends Event<unknown> {
  type: 'local';
}
export const isLocal = (event: Partial<Event>): event is MeetingEvent => event?.type === 'local';

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

    ...meeting
  }
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
    ...screening
  }
}

// Calendar Event
export function createCalendarEvent<M>(event: Partial<EventBase<Date | Timestamp, M>>, isOwner: boolean): Event<M> {
  return {
    ...createEvent(event),
    isOwner,
    draggable: isOwner,
    resizable: { beforeStart: isOwner, afterEnd: isOwner },
  }
}

export function createMeetingAttendee(user: User | AnonymousCredentials, status: AttendeeStatus = 'requesting'): MeetingAttendee {
  return {
    uid: user.uid,
    firstName: user.firstName,
    lastName: user.lastName,
    status
  }
}
