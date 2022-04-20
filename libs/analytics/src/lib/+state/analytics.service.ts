import { Inject, Injectable } from '@angular/core';
import { getAnalytics, logEvent } from '@angular/fire/analytics';
import { ActiveState, EntityState } from '@datorama/akita';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { where } from '@angular/fire/firestore';

import { map, take } from 'rxjs/operators';
import { centralOrgId } from '@env';
import { startOfDay } from 'date-fns';

// Blockframes
import { Analytics, AnalyticsTypes, EventName, createTitleMeta, Organization, Movie } from '@blockframes/model';
import { AuthService } from '@blockframes/auth/+state';
import { createDocumentMeta, formatDocumentMetaFromFirestore } from '@blockframes/model';
import { APP } from '@blockframes/utils/routes/utils';
import { App } from '@blockframes/utils/apps';

interface AnalyticsState extends EntityState<Analytics>, ActiveState<string> { };
export interface AnalyticsWithOrg extends Analytics<'title'> {
  org: Organization;
}

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'analytics' })
export class AnalyticsService extends CollectionService<AnalyticsState> {
  readonly useMemorization = false;
  private analytics = getAnalytics();

  constructor(
    private authService: AuthService,
    @Inject(APP) private app: App
  ) {
    super();
  }

  formatFromFirestore(analytic): Analytics<AnalyticsTypes> {
    return {
      ...analytic,
      _meta: formatDocumentMetaFromFirestore(analytic._meta)
    };
  }

  formatToFirestore(analytic: Partial<Analytics<AnalyticsTypes>>) {
    const profile = this.authService.profile;
    return {
      ...analytic,
      _meta: createDocumentMeta({
        createdFrom: this.app,
        createdBy: profile.uid
      })
    }
  }

  getTitleAnalytics(params?: { titleId?: string, uid?: string }) {
    const { orgId } = this.authService.profile;

    const query = [
      where('type', '==', 'title'),
      where('meta.ownerOrgIds', 'array-contains', orgId),
      where('_meta.createdFrom', '==', this.app)
    ];

    if (params?.titleId) query.push(where('meta.titleId', '==', params.titleId));
    if (params?.uid) query.push(where('meta.uid', '==', params.uid));

    return this.valueChanges(query).pipe(
      // Filter out analytics from owners of title
      map((analytics: Analytics<'title'>[]) => analytics.filter(analytic => !analytic.meta.ownerOrgIds.includes(analytic.meta.orgId) ))
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

  async addTitlePageView(title: Movie) {
    if (await this.isOperator()) return;

    const profile = this.authService.profile;
    if (!profile) return;

    const start = startOfDay(new Date());
    const analytics = await this.getValue([
      where('_meta.createdBy', '==', profile.uid),
      where('_meta.createdFrom', '==', this.app),
      where('meta.titleId', '==', title.id),
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

  /**
   * @dev We do not want to log centralOrg operators nor blockframes
   * admins nor concierge users actions on the platform.
   */
  private async isOperator(): Promise<boolean> {
    const isBlockframesAdmin = await this.authService.isBlockframesAdmin$.pipe(take(1)).toPromise();
    const profile = this.authService.profile;
    const isConcierge = profile?.email.includes('concierge');
    return isBlockframesAdmin || isConcierge || Object.values(centralOrgId).includes(profile?.orgId);
  }
}
