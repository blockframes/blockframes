import { firestore } from 'firebase';

type Timestamp = firestore.Timestamp;

// Event types
export type EventTypes = 'standard' | 'meeting' | 'screening' | 'local';
export type EventMeta = Meeting | Screening | {};
export interface Meeting {
  callUrl: string;
}
export interface Screening {
  /** A screening session can have one title */
  titleId: string;
}
export interface EventBase<D extends Timestamp | Date, Meta extends EventMeta = any> {
  id: string;
  ownerId: string;
  type: EventTypes;
  title: string;
  start: D;
  end: D;
  allDay: boolean,
  meta: Meta;
}

// firestore documents
type EventDocument<Meta> = EventBase<Timestamp, Meta>;
export type MeetingEventDocument = EventDocument<Meeting>;
export type ScreeningEventDocument = EventDocument<Screening>;
