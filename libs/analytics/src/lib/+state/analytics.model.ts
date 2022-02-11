import { DataEventBase, DataEventMeta, Event, Title } from "./analytics.firestore";


export interface DataEvent<Meta extends DataEventMeta = unknown> extends DataEventBase<Date, Meta> {}

export function createAnalyticsEvent<Meta extends DataEventMeta>(params: Partial<DataEvent<Meta>>): DataEvent {
  const meta: DataEventMeta = 
    isTitleAnalyticsEvent(params as DataEvent) ? createTitleMeta(params.meta)
    : isEventAnalyticsEvent(params as DataEvent) ? createEventMeta(params.meta)
    : {};

  return {
    id: '',
    name: 'page_view',
    type: 'title',
    ...params,
    meta
  };
}

export interface TitleDataEvent extends DataEvent<Title> {
  type: 'title';
}
export const isTitleAnalyticsEvent = (event: Partial<DataEvent>): event is TitleDataEvent => event.type === 'title';
export function createTitleMeta(meta: Partial<Title>): Title {
  return {
    titleId: '',
    orgId: '',
    userId: '',
    ownerOrgIds: [],
    ...meta
  };
}


export interface EventDataEvent extends DataEvent<Event> {
  type: 'event';
}
export const isEventAnalyticsEvent = (event: Partial<DataEvent>): event is EventDataEvent => event.type === 'event';
export function createEventMeta(meta: Partial<Event>): Event {
  return {
    eventId: '',
    userId: '',
    ownerOrgId: '',
    ...meta
  };
}