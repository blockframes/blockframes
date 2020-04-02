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
  /** The id of the owner. Can be a user or an organisation */
  ownerId: string;
  type: EventTypes;
  title: string;
  start: D;
  end: D;
  allDay: boolean,
  meta: Meta;
}

// @TODO (#2244) move this in the appropriate folder
export interface DocIndex {
  /** @dev doc author'id. Setted by a backend function */
  authorOrgId: string;
  /** @dev private custom config for a doc. Setted by an https callable function */
  config?: PrivateConfig | EventPrivateConfig
}

export interface PrivateConfig {};

export interface EventPrivateConfig extends PrivateConfig{
  /** @dev private url to access screening */
  url: string;
}

// firestore documents
type EventDocument<Meta> = EventBase<Timestamp, Meta>;
export type MeetingEventDocument = EventDocument<Meeting>;
export type ScreeningEventDocument = EventDocument<Screening>;
