import { AnalyticsEventBase, AnalyticsEventMeta, EventAnalyticsEventMeta, TitleAnalyticsEventMeta } from "./analytics.firestore";


export interface AnalyticsEvent<Meta extends AnalyticsEventMeta = unknown> extends AnalyticsEventBase<Date, Meta> {}

export function createAnalyticsEvent<Meta extends AnalyticsEventMeta>(params: Partial<AnalyticsEvent<Meta>>): AnalyticsEvent {
  const meta: AnalyticsEventMeta = 
    isTitleAnalyticsEvent(params as AnalyticsEvent) ? createTitleMeta(params.meta)
    : isEventAnalyticsEvent(params as AnalyticsEvent) ? createEventMeta(params.meta)
    : {};

  return {
    id: '',
    name: 'page_view',
    type: 'title',
    ...params,
    meta
  };
}

export interface TitleAnalyticsEvent extends AnalyticsEvent<TitleAnalyticsEvent> {
  type: 'title';
}
export const isTitleAnalyticsEvent = (event: Partial<Event>): event is TitleAnalyticsEvent => event.type === 'title';
export function createTitleMeta(meta: Partial<TitleAnalyticsEventMeta>): TitleAnalyticsEventMeta {
  return {
    titleId: '',
    orgId: '',
    userId: '',
    ownerOrgIds: [],
    ...meta
  };
}


export interface EventAnalyticsEvent extends AnalyticsEvent<EventAnalyticsEvent> {
  type: 'event';
}
export const isEventAnalyticsEvent = (event: Partial<Event>): event is EventAnalyticsEvent => event.type === 'event';
export function createEventMeta(meta: Partial<EventAnalyticsEventMeta>): EventAnalyticsEventMeta {
  return {
    eventId: '',
    userId: '',
    ownerOrgId: '',
    ...meta
  };
}