
import type firebase from 'firebase';
import { DocumentMeta } from "@blockframes/utils/models-meta";
type Timestamp = firebase.firestore.Timestamp;

export type EventName = 'page_view' | 'screening_requested' | 'promo_video_started' | 'added_to_wishlist' | 'promo_element_opened' | 'asking_price_requested';
export type EventType = 'title' | 'event';

export type DataEventMeta = Title | Event | unknown;

export interface Title {
  titleId: string;
  orgId: string;
  userId: string;
  ownerOrgIds: string[];
}

export interface Event {
  eventId: string;
  userId: string;
  orgId?: string;
  ownerOrgId: string;
}

export interface DataEventBase<D extends Timestamp | Date, Meta extends DataEventMeta = Record<string, unknown>> {
  id: string;
  name: EventName;
  type: EventType;
  meta: Meta;
  _meta?: DocumentMeta<D>;
}

// firestore documents
export type DataEventDocument<Meta> = DataEventBase<Timestamp, Meta>;
export type TitleAnalyticsEventDocument = DataEventDocument<Title>;
export type EventAnalyticsEventDocument = DataEventDocument<Event>;