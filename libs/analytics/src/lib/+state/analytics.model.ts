import { DocumentMeta } from '@blockframes/utils/models-meta';
import { DataEventBase, DataRecord, EventType, Title, Event } from "./analytics.firestore";


export interface DataEvent<key extends keyof DataRecord> extends DataEventBase<key, Date>{
  _meta: DocumentMeta<Date>
}

export function createDataEvent<key extends keyof DataRecord>(params: Partial<DataEvent<key>>): DataEvent<EventType>  {
  if (isTitleDataEvent(params)) {
    const meta = createTitleMeta(params.meta);
    const res: DataEvent<'title'> = {
      id: '',
      name: 'page_view',
      type: 'title',
      ...params,
      meta
    }
    return res
  } else if (isEventDataEvent(params )) {
    const meta = createEventMeta(params.meta);
    const res: DataEvent<'event'> = {
      id: '',
      name: 'page_view',
      type: 'event',
      ...params,
      meta
    }
    return res
  }
}


export const isTitleDataEvent = (event: Partial<DataEvent<EventType>>): event is DataEvent<'title'> => event.type === 'title';
export function createTitleMeta(meta: Partial<Title>): Title {
  return {
    titleId: '',
    orgId: '',
    userId: '',
    ownerOrgIds: [],
    ...meta
  };
}

export const isEventDataEvent = (event: Partial<DataEvent<EventType>>): event is DataEvent<'event'> => event.type === 'event';
export function createEventMeta(meta: Partial<Event>): Event {
  return {
    eventId: '',
    userId: '',
    ownerOrgId: '',
    ...meta
  };
}