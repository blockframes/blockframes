import { compareDates, FormEntity, FormList } from '@blockframes/utils/form';
import {
  Event,
  createEvent,
  isMeeting,
  createMeeting,
  createScreening,
  isScreening,
  isSlate,
  createSlate,
  Meeting,
  Screening,
  Slate
} from '@blockframes/model';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';


// Event
export function createEventControl(params?: Partial<Event>) {
  const event = createEvent(params);
  return {
    id: new UntypedFormControl(event.id),
    accessibility: new UntypedFormControl(event.accessibility),
    isSecret: new UntypedFormControl(event.isSecret),
    ownerOrgId: new UntypedFormControl(event.ownerOrgId),
    type: new UntypedFormControl(event.type, Validators.required),
    title: new UntypedFormControl(event.title, Validators.required),
    start: new UntypedFormControl(event.start, compareDates('start', 'end', 'start')),
    end: new UntypedFormControl(event.end, compareDates('start', 'end', 'end')),
    allDay: new UntypedFormControl(event.allDay),
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
function createMetaControl(event: Event): MeetingForm | ScreeningForm | SlateForm | UntypedFormGroup {
  if (isMeeting(event)) {
    return new MeetingForm(event.meta)
  } else if (isScreening(event)) {
    return new ScreeningForm(event.meta);
  } else if (isSlate(event)) {
    return new SlateForm(event.meta);
  } else {
    return new UntypedFormGroup({});
  }
}

// Meeting
export function createMeetingControl(params?: Partial<Meeting>) {
  const meeting = createMeeting(params);
  return {
    organizerUid: new UntypedFormControl(meeting.organizerUid),
    description: new UntypedFormControl(meeting.description, [Validators.maxLength(500)]),
    files: FormList.factory(meeting.files, el => new UntypedFormControl(el)),
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
    titleId: new UntypedFormControl(screening.titleId),
    description: new UntypedFormControl(screening.description, [Validators.maxLength(500)]),
    organizerUid: new UntypedFormControl(screening.organizerUid)
  }
}

type ScreeningControl = ReturnType<typeof createScreeningControl>;

export class ScreeningForm extends FormEntity<ScreeningControl, Screening> {
  constructor(screening?: Partial<Screening>) {
    super(createScreeningControl(screening), compareDates('start', 'end'))
  }

  get titleId() {
    return this.get('titleId');
  }
}

// Slate Presentation
export function createSlateControl(params?: Partial<Slate>) {
  const slate = createSlate(params);
  return {
    description: new UntypedFormControl(slate.description, [Validators.maxLength(500)]),
    organizerUid: new UntypedFormControl(slate.organizerUid),
    titleIds: new UntypedFormControl(slate.titleIds),
    videoId: new UntypedFormControl(slate.videoId)
  }
}

type SlateControl = ReturnType<typeof createSlateControl>;

export class SlateForm extends FormEntity<SlateControl, Slate> {
  constructor(slate?: Partial<Slate>) {
    super(createSlateControl(slate), compareDates('start', 'end'));
  }

  get videoId() {
    return this.get('videoId');
  }
}
