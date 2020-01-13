import { ANALYTICS, Analytics } from './analytics.module';
import { Inject, Injectable } from '@angular/core';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';

export const enum AnalyticsEvents {
  removedFromWishlist = 'removed_from_wishlist',
  addedToWishlist = 'added_to_wishlist',
  wishlistSend = 'wishlist_send',
  removedSalesAgent = 'removed_sales_agent',
  addedSalesAgent = 'added_sales_agent',
  addedGenre = 'added_genre',
  removedGenre = 'removed_genre',
  addedLanguage = 'added_language',
  removedLanguage = 'removed_language',
  removedMovieStatus = 'removed_movie_status',
  addedMovieStatus = 'added_movie_status',
  searchbarSearchType = 'searchbar_search_type',
  promoReelOpened = 'promo_reel_opened',
  pageView = 'page_view'
}

@Injectable({providedIn: 'root'})
export class FireAnalytics {
  constructor(@Inject(ANALYTICS) public analytics: Analytics, private authQuery: AuthQuery) {}

  public event(name: string, params: Record<string, any>) {
    try {
      this.analytics.logEvent(name, { ...params, uid: this.authQuery.userId });
    } catch {
      this.analytics.logEvent(name, { ...params });
    }
  }
}
