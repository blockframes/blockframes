
import type firebase from 'firebase';
import { DocumentMeta } from "@blockframes/utils/models-meta";
type Timestamp = firebase.firestore.Timestamp;

export type EventName = 'page_view' | 'screening_requested' | 'promo_video_started' | 'added_to_wishlist' | 'promo_element_opened' | 'asking_price_requested';
export type EventType = 'title' | 'event';

export type AnalyticsEventMeta = TitleAnalyticsEventMeta | EventAnalyticsEventMeta | unknown;

export interface TitleAnalyticsEventMeta {
  titleId: string;
  orgId: string;
  userId: string;
  ownerOrgIds: string[];
}

export interface EventAnalyticsEventMeta {
  eventId: string;
  userId: string;
  orgId?: string;
  ownerOrgId: string;
}

export interface AnalyticsEventBase<D extends Timestamp | Date, Meta extends AnalyticsEventMeta = Record<string, unknown>> {
  id: string;
  name: EventName;
  type: EventType;
  meta: Meta;
  _meta?: DocumentMeta<D>;
}

// firestore documents
export type AnalyticsEventDocument<Meta> = AnalyticsEventBase<Timestamp, Meta>;
export type TitleAnalyticsEventDocument = AnalyticsEventDocument<TitleAnalyticsEventMeta>;
export type EventAnalyticsEventDocument = AnalyticsEventDocument<EventAnalyticsEventMeta>;