import { CalendarEvent } from 'angular-calendar';
import { toDate } from '@blockframes/utils';
import { Meeting, EventBase, Screening, EventMeta } from './event.firestore';

// Event
export type Event<Meta extends EventMeta = any> = EventBase<Date, Meta> & CalendarEvent<Meta>;
export function createEvent<Meta extends EventMeta>(params: Partial<Event<Meta>> = {}): Event<Meta> {
  const meta: any = 
    isMeeting(params) ? createMeeting(params.meta)
    : isScreening(params) ? createScreening(params.meta)
    : {};

  return {
    id: '',
    title: '',
    ownerId: '',
    type: 'standard',
    allDay: false,
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
}
export const isMeeting = (event: Partial<Event>): event is MeetingEvent => event?.type === 'meeting';
export function createMeeting(meeting: Partial<Meeting>): Meeting {
  return {
    callUrl: ''
  }
}

// Screening
export interface ScreeningEvent extends Event<Screening> {
  type: 'screening';
}
export const isScreening = (event: Partial<Event>): event is ScreeningEvent => event?.type === 'screening';
export function createScreening(screening: Partial<Screening>): Screening {
  return {
    movieId: ''
  }
}


// Calendar Event
export function createCalendarEvent(event: Event, currentUserId: string): Event {
  const isOwner = event.ownerId === currentUserId;
  return {
    ...createEvent(event),
    draggable: isOwner,
    resizable: { beforeStart: isOwner, afterEnd: isOwner },
  }
}