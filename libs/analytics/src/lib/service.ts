import { Inject, Injectable, OnDestroy } from '@angular/core';
import { isSupported, logEvent, setUserId, Analytics as FirebaseAnalytics } from 'firebase/analytics';
import { where } from 'firebase/firestore';
import { centralOrgId } from '@env';
import { startOfDay, subMinutes } from 'date-fns';
import { firstValueFrom, Subscription, map } from 'rxjs';
import { CallableFunctions, FIRE_ANALYTICS } from 'ngfire';

// Blockframes
import {
  Analytics,
  AnalyticsTypes,
  EventName,
  createTitleMeta,
  Movie,
  createDocumentMeta,
  MovieAvailsSearch,
  Module,
  createTitleSearchMeta,
  Organization,
  createOrganizationMeta
} from '@blockframes/model';
import { AuthService } from '@blockframes/auth/service';
import { BlockframesCollection } from '@blockframes/utils/abstract-service';

interface AnalyticsActiveUser {
  user_id: string,
  first_connexion: {
    value: Date
  },
  last_connexion: {
    value: Date
  },
  session_count: number,
  page_view: number
}

interface ConnectedUserInfo {
  uid: string,
  firstConnexion: Date,
  lastConnexion: Date,
  pageView: number,
  sessionCount: number,
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService extends BlockframesCollection<Analytics> implements OnDestroy {
  readonly path = 'analytics';
  private subscription?: Subscription;

  private analyticsCache: ConnectedUserInfo[] = [];
  private nonUiTitleSearch: MovieAvailsSearch;

  private getAnalyticsActiveUsers = this.functions.prepare<unknown, AnalyticsActiveUser[]>('getAnalyticsActiveUsers');

  constructor(
    @Inject(FIRE_ANALYTICS) private analytics: FirebaseAnalytics,
    private authService: AuthService,
    private functions: CallableFunctions
  ) {
    super();
    // User tracking
    isSupported().then((supported) => {
      if (supported) {
        this.subscription = authService.user$.subscribe(user => setUserId(analytics, user?.uid));
      }
    })
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  toFirestore(analytic: Partial<Analytics<AnalyticsTypes>>, actionType: 'add' | 'update') {
    const profile = this.authService.anonymousOrRegularProfile;
    if (actionType === 'update') return analytic;

    return {
      ...analytic,
      _meta: createDocumentMeta({
        createdFrom: this.app,
        createdBy: profile.uid
      })
    }
  }

  getTitleAnalytics(params?: { titleId?: string, uid?: string, eventName?: EventName }) {
    const { orgId } = this.authService.profile;

    const query = [
      where('type', '==', 'title'),
      where('meta.ownerOrgIds', 'array-contains', orgId),
      where('_meta.createdFrom', '==', this.app)
    ];

    if (params?.titleId) query.push(where('meta.titleId', '==', params.titleId));
    if (params?.uid) query.push(where('meta.uid', '==', params.uid));
    if (params?.eventName) query.push(where('name', '==', params.eventName));

    return this.valueChanges(query).pipe(
      // Filter out analytics from owners of title
      map((analytics: Analytics<'title'>[]) => analytics.filter(analytic => !analytic.meta.ownerOrgIds.includes(analytic.meta.orgId)))
    );
  }

  async addTitle(name: EventName, title: Movie) {
    if (await this.isOperator()) return;

    const profile = this.authService.profile;
    if (!profile) return;

    const meta = createTitleMeta({
      titleId: title.id,
      orgId: profile.orgId,
      uid: profile.uid,
      ownerOrgIds: title.orgIds
    });
    logEvent(this.analytics, name, meta);
    return this.add({ type: 'title', name, meta });
  }

  async addPdfExport(search: MovieAvailsSearch, titleCount: number, module: Module, status: boolean) {
    if (await this.isOperator()) return;
    const profile = this.authService.profile;
    if (!profile) return;

    const meta = createTitleSearchMeta({
      search,
      module,
      orgId: profile.orgId,
      uid: profile.uid,
      titleCount,
      status
    });

    return this.add({ type: 'titleSearch', name: 'exportedTitles', meta });
  }

  async addTitleFilter(_search: MovieAvailsSearch & { titleId?: string, ownerOrgIds?: string[] }, module: Module, eventName: 'filteredTitles' | 'filteredAvailsCalendar' | 'filteredAvailsMap', nonUiSearch = false) {
    if (await this.isOperator()) return;
    const profile = this.authService.profile;
    if (!profile) return;

    const search = { search: { ..._search.search }, avails: _search.avails };
    delete search.search?.page;

    // Store search filters not changed by user through UI (ie: loaded from params or saved search)
    if (nonUiSearch) {
      this.nonUiTitleSearch = search;
      return;
    }

    // If search is same as nonUiTitleSearch, this search was not performed by an user an should not be tracked
    if (JSON.stringify(this.nonUiTitleSearch) === JSON.stringify(search)) return;

    const nowMinusOneMin = subMinutes(new Date(), 1);
    const analytics = await this.getValue([
      where('_meta.createdBy', '==', profile.uid),
      where('_meta.createdFrom', '==', this.app),
      where('meta.module', '==', module),
      where('name', '==', eventName)
    ]);

    const meta = createTitleSearchMeta({
      search,
      module,
      orgId: profile.orgId,
      uid: profile.uid,
    });

    if (_search.titleId) meta.titleId = _search.titleId;
    if (_search.ownerOrgIds) meta.ownerOrgIds = _search.ownerOrgIds;

    const existingEvent = analytics.find(analytic => analytic._meta.createdAt > nowMinusOneMin);
    if (existingEvent) {
      existingEvent.meta = meta;
      return this.update(existingEvent);
    } else {
      return this.add({ type: 'titleSearch', name: eventName, meta });
    }
  }

  async addSavedOrLoadedSearch(search: MovieAvailsSearch, module: Module, eventName: 'savedFilters' | 'loadedFilters') {
    if (await this.isOperator()) return;
    const profile = this.authService.profile;
    if (!profile) return;

    const meta = createTitleSearchMeta({
      search,
      module,
      orgId: profile.orgId,
      uid: profile.uid
    });

    return this.add({ type: 'titleSearch', name: eventName, meta });
  }

  async addTitlePageView(title: Movie) {
    if (await this.isOperator()) return;

    const profile = this.authService.profile;
    if (!profile) return;

    const start = startOfDay(new Date());
    const analytics = await this.getValue([
      where('_meta.createdBy', '==', profile.uid),
      where('_meta.createdFrom', '==', this.app),
      where('meta.titleId', '==', title.id),
      where('type', '==', 'title'),
      where('name', '==', 'pageView')
    ]);
    // only one pageView event per day per title per user is recorded.
    if (analytics.some(analytic => analytic._meta.createdAt > start)) return;

    const meta = createTitleMeta({
      titleId: title.id,
      orgId: profile.orgId,
      uid: profile.uid,
      ownerOrgIds: title.orgIds
    });

    return this.add({
      name: 'pageView',
      type: 'title',
      meta
    });
  }

  async addOrganizationPageView(org: Organization) {
    if (await this.isOperator()) return;

    const profile = this.authService.anonymousOrRegularProfile;
    if (!profile) return;

    const start = startOfDay(new Date());
    const analytics = await this.getValue([
      where('_meta.createdBy', '==', profile.uid),
      where('_meta.createdFrom', '==', this.app),
      where('meta.organizationId', '==', org.id),
      where('type', '==', 'organization'),
      where('name', '==', 'pageView')
    ]);
    // only one pageView event per day per org per user is recorded.
    if (analytics.some(analytic => analytic._meta.createdAt > start)) return;

    const meta = createOrganizationMeta({
      organizationId: org.id,
      orgId: profile.orgId,
      uid: profile.uid,
      profile
    });

    return this.add({
      name: 'pageView',
      type: 'organization',
      meta
    });
  }

  /**
   * @dev We do not want to log centralOrg operators nor blockframes
   * admins nor concierge users actions on the platform.
   */
  private async isOperator() {
    const isBlockframesAdmin = await firstValueFrom(this.authService.isBlockframesAdmin$);
    const profile = this.authService.profile;
    const isConcierge = profile?.email.includes('concierge');
    return isBlockframesAdmin || isConcierge || Object.values(centralOrgId).includes(profile?.orgId);
  }

  public async loadAnalyticsData() {
    if (this.analyticsCache.length) return;
    const rows = await this.getAnalyticsActiveUsers({});
    this.analyticsCache = rows.map(r => ({
      uid: r.user_id,
      firstConnexion: r.first_connexion.value,
      lastConnexion: r.last_connexion.value,
      sessionCount: r.session_count,
      pageView: r.page_view,
    }));
  }

  getLastConnexion(uid: string) {
    const userInfo = this.analyticsCache.find(u => u.uid === uid);
    if (userInfo && userInfo.lastConnexion) {
      return userInfo.lastConnexion;
    }
  }

  getFirstConnexion(uid: string) {
    const userInfo = this.analyticsCache.find(u => u.uid === uid);
    if (userInfo && userInfo.firstConnexion) {
      return userInfo.firstConnexion;
    }
  }

  getSessionCount(uid: string) {
    const userInfo = this.analyticsCache.find(u => u.uid === uid);
    if (userInfo && userInfo.sessionCount) {
      return userInfo.sessionCount;
    }
  }

  getPageView(uid: string) {
    const userInfo = this.analyticsCache.find(u => u.uid === uid);
    if (userInfo && userInfo.pageView) {
      return userInfo.pageView;
    }
  }
}
