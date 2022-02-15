import { Analytics, AnalyticsTypes, MetaTitle } from "./analytics.firestore";


export const isTitleDataEvent = (event: Partial<Analytics<AnalyticsTypes>>): event is Analytics<'title'> => event.type === 'title';
export function createTitleMeta(meta: Partial<MetaTitle>): MetaTitle {
  return {
    titleId: '',
    orgId: '',
    userId: '',
    ownerOrgIds: [],
    ...meta
  };
}
