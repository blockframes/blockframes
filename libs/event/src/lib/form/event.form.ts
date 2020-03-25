import { FormEntity } from '@blockframes/utils/form';
import { Event, createEvent } from '../+state/event.model';
import { FormControl } from '@angular/forms';

export function createEventControl(params?: Partial<Event>) {
  const event = createEvent(params);
  return {
    id: new FormControl(event.id),
    type: new FormControl(event.type),
    title: new FormControl(event.title),
    start: new FormControl(event.start),
    end: new FormControl(event.end),
    allDay: new FormControl(event.allDay)
  };
}

type EventControl = ReturnType<typeof createEventControl>;

export class EventForm extends FormEntity<EventControl, Event> {
  constructor(event?: Partial<Event>) {
    super(createEventControl(event))
  }
}