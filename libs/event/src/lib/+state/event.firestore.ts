import type firebase from 'firebase';
import { StorageFile } from '@blockframes/media/+state/media.firestore';
import { AccessibilityTypes } from '@blockframes/utils/static-model/types';
import { Person } from '@blockframes/utils/common-interfaces/identity';
type Timestamp = firebase.firestore.Timestamp;

// Event types
export type EventTypes = 'standard' | 'meeting' | 'screening' | 'local';
export type EventMeta = Meeting | Screening | unknown;

export type AttendeeStatus = 'owner' | 'requesting' | 'accepted' | 'denied' | 'ended';
export interface MeetingAttendee extends Person {
  uid: string,
  status: AttendeeStatus,
}

export interface Meeting {
  organizerUid: string;
  description: string;
  attendees: Record<string, MeetingAttendee>;
  files: StorageFile[];
  selectedFile: string;
  controls: Record<string, MeetingMediaControl>
}

export interface MeetingPdfControl {
  type: 'pdf';
  currentPage: number;
  totalPages: number;
}

export interface MeetingVideoControl {
  type: 'video';
  isPlaying: boolean;
  position: number;
  duration: number;
}

export type MeetingMediaControl = MeetingPdfControl | MeetingVideoControl;

/** Maximum number of invitations that can be sent for a given Meeting */
export const MEETING_MAX_INVITATIONS_NUMBER = 9;

export interface Screening {
  /** A screening session can have one title */
  titleId: string;
  description: string;
  organizerUid: string;
}

export interface EventBase<D extends Timestamp | Date, Meta extends EventMeta = Record<string, unknown>> {
  id: string;
  ownerOrgId: string;
  accessibility: AccessibilityTypes;
  isSecret: boolean;
  type: EventTypes;
  title: string;
  start: D;
  end: D;
  allDay: boolean,
  meta: Meta;
}

// firestore documents
export type EventDocument<Meta> = EventBase<Timestamp, Meta>;
export type MeetingEventDocument = EventDocument<Meeting>;
export type ScreeningEventDocument = EventDocument<Screening>;

// This variable define the duration (in seconds) of a video link before it expires
export const linkDuration = 60 * 60 * 5; // 5 hours in seconds = 60 seconds * 60 minutes * 5 = 18 000 seconds
