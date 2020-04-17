import { firestore } from 'firebase';
import { PrivateConfig } from '@blockframes/utils/common-interfaces/utility';

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
  /** @dev The id of the owner. Can be a user or an organisation given the event.type **/
  ownerId: string;
  isPrivate: boolean;
  type: EventTypes;
  title: string;
  start: D;
  end: D;
  allDay: boolean,
  meta: Meta;
}

export interface EventPrivateConfig extends PrivateConfig{
  /** @dev private url to access screening */
  url: string;
}

// firestore documents
export type EventDocument<Meta> = EventBase<Timestamp, Meta>;
export type MeetingEventDocument = EventDocument<Meeting>;
export type ScreeningEventDocument = EventDocument<Screening>;
