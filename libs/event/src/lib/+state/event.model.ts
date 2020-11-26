import { CalendarEvent } from 'angular-calendar';
import { Meeting, EventBase, Screening, EventMeta } from './event.firestore';
import { toDate } from '@blockframes/utils/helpers';
import { Movie } from '@blockframes/movie/+state';
import { Organization } from '@blockframes/organization/+state';
import { User } from '@blockframes/auth/+state';
export { EventsAnalytics } from './event.firestore';

// Event
export interface Event<Meta extends EventMeta = any> extends EventBase<Date, Meta>, CalendarEvent<Meta> {
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
export function createEvent<Meta extends EventMeta>(params: Partial<EventBase<any, Meta>> = {}): Event<Meta> {
  const meta: any =
    isMeeting(params) ? createMeeting(params.meta)
    : isScreening(params) ? createScreening(params.meta)
    : {};

  return {
    id: '',
    title: '',
    ownerId: '',
    isPrivate: true,
    type: 'standard',
    allDay: false,
    isOwner: false,
    ...params,
    start: toDate(params.start || new Date()),
    end: toDate(params.end || new Date()),
    meta
  };
}

// Local
export interface LocalEvent extends Event<{}> {
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
    organizerId: '',
    description: '',
    files: [],
    ownerIsPresent: false,

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
    ...screening
  }
}

// Calendar Event
export function createCalendarEvent<M>(event: Partial<EventBase<any, M>>, isOwner: boolean): Event<M> {
  return {
    ...createEvent(event),
    isOwner,
    draggable: isOwner,
    resizable: { beforeStart: isOwner, afterEnd: isOwner },
  }
}

