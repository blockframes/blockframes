import { createMovie, createOrganization, createUser } from "@blockframes/model";
import { AggregatedAnalytic, Analytics, MetaTitle } from "./analytics.firestore";

export const isTitleDataEvent = (event: Partial<Analytics>): event is Analytics<'title'> => event.type === 'title';
export function createTitleMeta(meta: Partial<MetaTitle>): MetaTitle {
  return {
    titleId: '',
    orgId: '',
    uid: '',
    ownerOrgIds: [],
    ...meta
  };
};


export function createAggregatedAnalytic(analytic: Partial<AggregatedAnalytic>): AggregatedAnalytic {
  return {
    addedToWishlist: 0,
    askingPriceRequested: 0,
    pageView: 0,
    promoReelOpened: 0,
    removedFromWishlist: 0,
    screeningRequested: 0,
    ...analytic
  };
}