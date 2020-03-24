import { CalendarEvent } from 'angular-calendar';
import { toDate } from '@blockframes/utils';

export interface Event extends CalendarEvent {
  userId: string;
}

export function createEvent(params: Partial<Event>) {
  return {

  } as Event;
}

export function createCalendarEvent(event: Event, currentUserId: string): Event {
  const isOwner = event.userId === currentUserId;
  return {
    ...event,
    start: toDate(event.start),
    end: toDate(event.end),
    draggable: isOwner,
    resizable: { beforeStart: isOwner, afterEnd: isOwner },
  }
}