import { compareDates, FormEntity, FormList } from '@blockframes/utils/form';
import { Event, createEvent, isMeeting, createMeeting, createScreening, isScreening } from '../+state/event.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Meeting, Screening } from '../+state/event.firestore';


// Event
export function createEventControl(params?: Partial<Event>) {
  const event = createEvent(params);
  return {
    id: new FormControl(event.id),
    isPrivate: new FormControl(event.isPrivate),
    isSecret: new FormControl(event.isSecret),
    ownerOrgId: new FormControl(event.ownerOrgId),
    type: new FormControl(event.type, Validators.required),
    title: new FormControl(event.title, Validators.required),
    start: new FormControl(event.start, compareDates('start', 'end', 'start')),
    end: new FormControl(event.end, compareDates('start', 'end', 'end')),
    allDay: new FormControl(event.allDay),
    meta: createMetaControl(event)
  };
}

type EventControl = ReturnType<typeof createEventControl>;

export class EventForm extends FormEntity<EventControl, Event> {
  constructor(event?: Partial<Event>) {
    super(createEventControl(event))
  }

  get meta() {
    return this.get('meta');
  }

  get id() {
    return this.get('id');
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
    organizerUid: new FormControl(meeting.organizerUid),
    description: new FormControl(meeting.description, [Validators.maxLength(500)]),
    files: FormList.factory(meeting.files, el => new FormControl(el)),
  }
}

type MeetingControl = ReturnType<typeof createMeetingControl>;

export class MeetingForm extends FormEntity<MeetingControl, Meeting> {
  constructor(meeting?: Partial<Meeting>) {
    super(createMeetingControl(meeting), compareDates('start', 'end'))
  }

  get files() {
    return this.get('files');
  }
}

// Screening
export function createScreeningControl(params?: Partial<Screening>) {
  const screening = createScreening(params);
  return {
    titleId: new FormControl(screening.titleId),
    description: new FormControl(screening.description, [Validators.maxLength(500)]),
  }
}

type ScreeningControl = ReturnType<typeof createScreeningControl>;

export class ScreeningForm extends FormEntity<ScreeningControl, Screening> {
  constructor(screening?: Partial<Screening>) {
    super(createScreeningControl(screening), compareDates('start', 'end'))
  }
}
