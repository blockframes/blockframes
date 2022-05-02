import { Injectable } from '@angular/core';
import { getAnalytics, logEvent } from 'firebase/analytics';
import { where } from 'firebase/firestore';
import { map, take } from 'rxjs/operators';
import { centralOrgId } from '@env';
import { startOfDay } from 'date-fns';

// Blockframes
import { Analytics, AnalyticsTypes, EventName, createTitleMeta, Movie } from '@blockframes/model';
import { AuthService } from '@blockframes/auth/+state/auth.service';
import { createDocumentMeta } from '@blockframes/model';
import { BlockframesCollection } from '@blockframes/utils/abstract-service';

@Injectable({ providedIn: 'root' })
export class AnalyticsService extends BlockframesCollection<Analytics> {
  readonly path = 'analytics';

  private analytics = getAnalytics();

  constructor(
    private authService: AuthService,
  ) {
    super();
  }

  toFirestore(analytic: Partial<Analytics<AnalyticsTypes>>, actionType: 'add' | 'update') {
    const profile = this.authService.profile;
    if (actionType === 'update') return analytic;

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
