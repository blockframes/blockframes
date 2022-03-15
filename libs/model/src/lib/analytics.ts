import { DocumentMeta } from "@blockframes/utils/models-meta";

export type EventName = 'page_view' | 'screening_requested' | 'promo_video_started' | 'added_to_wishlist' | 'promo_element_opened' | 'asking_price_requested';

interface AnalyticsTypeRecord {
  title: MetaTitle;
  event: MetaEvent;
}

export type AnalyticsTypes = keyof AnalyticsTypeRecord;

export interface Analytics<type extends AnalyticsTypes = AnalyticsTypes> {
  id: string;
  name: EventName;
  type: type;
  meta: AnalyticsTypeRecord[type];
  _meta?: DocumentMeta<Date>;
}

export interface MetaTitle {
  titleId: string;
  orgId: string;
  userId: string;
  ownerOrgIds: string[];
}

export interface MetaEvent {
  eventId: string;
  userId: string;
  orgId?: string;
  ownerOrgId: string;
}

export const isTitleDataEvent = (event: Partial<Analytics>): event is Analytics<'title'> => event.type === 'title';
export function createTitleMeta(meta: Partial<MetaTitle>): MetaTitle {
  return {
    titleId: '',
    orgId: '',
    userId: '',
    ownerOrgIds: [],
    ...meta
  };
};
