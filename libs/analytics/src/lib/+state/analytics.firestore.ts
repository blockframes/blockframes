
import type firebase from 'firebase';
import { DocumentMeta } from "@blockframes/utils/models-meta";
type Timestamp = firebase.firestore.Timestamp;

export type EventName = 'page_view' | 'screening_requested' | 'promo_video_started' | 'added_to_wishlist' | 'promo_element_opened' | 'asking_price_requested';
export type EventType = 'title' | 'event' | 'unknown';

export interface DataRecord {
  title: Title;
  event: Event;
  unknown: unknown;
}

export interface DataEventBase<key extends keyof DataRecord, Date> {
  id: string;
  name: EventName;
  type: key;
  meta: DataRecord[key];
  _meta?: DocumentMeta<Date>;
}

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


// firestore documents
export type DataEventDocument = DataEventBase<'unknown', Timestamp>;
export type TitleAnalyticsEventDocument = DataEventBase<'title', Timestamp>;
export type EventAnalyticsEventDocument = DataEventBase< 'event', Timestamp>;