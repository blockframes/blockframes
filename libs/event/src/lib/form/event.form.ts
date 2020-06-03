import { FormEntity, urlValidators } from '@blockframes/utils/form';
import { Event, createEvent, isMeeting, createMeeting, createScreening, isScreening } from '../+state/event.model';
import { FormControl, FormGroup } from '@angular/forms';
import { Meeting, Screening } from '../+state/event.firestore';

// Event
export function createEventControl(params?: Partial<Event>) {
  const event = createEvent(params);
  return {
    id: new FormControl(event.id),
    isPrivate: new FormControl(event.isPrivate),
    ownerId: new FormControl(event.ownerId),
    type: new FormControl(event.type),
    title: new FormControl(event.title),
    start: new FormControl(event.start),
    end: new FormControl(event.end),
    allDay: new FormControl(event.allDay),
    meta: createMetaControl(event)
  };
}

type EventControl = ReturnType<typeof createEventControl>;

export class EventForm extends FormEntity<EventControl, Event> {
  constructor(event?: Partial<Event>) {
    super(createEventControl(event))
  }
}

// Meta
function createMetaControl(event: Event): MeetingForm | ScreeningForm | FormGroup {
  if (isMeeting(event)) {
    return new MeetingForm(event.meta)
  } else if (isScreening(event)) {
    return new ScreeningForm(event.meta);
  } else {
    return new FormGroup({});
  }
}

// Meeting
export function createMeetingControl(params?: Partial<Meeting>) {
  const meeting = createMeeting(params);
  return {
    callUrl: new FormControl(meeting.callUrl, urlValidators),
    organizerId: new FormControl(meeting.organizerId),
    description: new FormControl(meeting.description),
  }
}

type MeetingControl = ReturnType<typeof createMeetingControl>;

export class MeetingForm extends FormEntity<MeetingControl, Meeting> {
  constructor(meeting?: Partial<Meeting>) {
    super(createMeetingControl(meeting))
  }
}

// Screening
export function createScreeningControl(params?: Partial<Screening>) {
  const screening = createScreening(params);
  return {
    titleId: new FormControl(screening.titleId)
  }
}

type ScreeningControl = ReturnType<typeof createScreeningControl>;

export class ScreeningForm extends FormEntity<ScreeningControl, Screening> {
  constructor(screening?: Partial<Screening>) {
    super(createScreeningControl(screening))
  }
}