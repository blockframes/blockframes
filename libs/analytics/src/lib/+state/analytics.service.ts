import { Inject, Injectable } from '@angular/core';
import { getAnalytics, logEvent } from '@angular/fire/analytics';
import { ActiveState, EntityState } from '@datorama/akita';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { doc, DocumentReference, docData, getDoc } from '@angular/fire/firestore';

import { map, take } from 'rxjs/operators';
import { centralOrgId } from '@env';
import { startOfDay } from 'date-fns';

// Blockframes
import { Analytics, AnalyticsTypeRecord, AnalyticsTypes, EventName, createTitleMeta, Organization } from '@blockframes/model';
import { AuthService } from '@blockframes/auth/+state';
import { createMovie, createDocumentMeta, formatDocumentMetaFromFirestore } from '@blockframes/model';
import { APP } from '@blockframes/utils/routes/utils';
import { App } from '@blockframes/utils/apps';
import { joinWith } from '@blockframes/utils/operators';

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

  getTitleAnalytics(titleId?: string) {
    const { orgId } = this.authService.profile;

    const query = titleId ? [
      where('type', '==', 'title'),
      where('meta.ownerOrgIds', 'array-contains', orgId),
      where('_meta.createdFrom', '==', this.app),
      where('meta.titleId', '==', titleId),
    ] : [
      where('type', '==', 'title'),
      where('meta.ownerOrgIds', 'array-contains', orgId),
      where('_meta.createdFrom', '==', this.app)
    ];

    return this.valueChanges(query).pipe(
      joinWith({
        // TODO #7273 use OrganizationService instead once Akita has been replaced by ng-fire (currently using MovieService results in error)
        org: analytic => {
          const ref = doc(this.db, `orgs/${analytic.meta.orgId}`) as DocumentReference<Organization>;
          return docData(ref);
        }
      }, { shouldAwait: true }),
      // Filter out analytics from owners of title
      map((analytics: AnalyticsWithOrg[]) => analytics.filter(analytic => !analytic.meta.ownerOrgIds.includes(analytic.org.id) ))
    );
  }

  async addTitle(name: EventName, titleId: string) {
    if (await this.isOperator()) return;

    const profile = this.authService.profile;

    // TODO #7273 use MovieService instead once Akita has been replaced by ng-fire (currently using MovieService results in error)
    const ref = doc(this.db, `movies/${titleId}`);
    const document = await getDoc(ref);
    const title = createMovie(document.data());

    const meta = createTitleMeta({
      titleId,
      orgId: profile.orgId,
      uid: profile.uid,
      ownerOrgIds: title.orgIds
    });
    logEvent(this.analytics, name, meta);
    return this.add({ type: 'title', name, meta });
  }

  async addPageView(type: AnalyticsTypes, id: string) {
    if (await this.isOperator()) return;

    const profile = this.authService.profile;
    if (!profile) return;

    let meta: AnalyticsTypeRecord[AnalyticsTypes];
    if (type === 'title') {
      const start = startOfDay(new Date());
      const analytics = await this.getValue([
        where('_meta.createdBy', '==', profile.uid),
        where('_meta.createdFrom', '==', this.app),
        where('meta.titleId', '==', id),
        where('name', '==', 'pageView')
      ]);
      // only one pageView event per day per title per user is recorded.
      if (analytics.some(analytic => analytic._meta.createdAt > start)) return;

      // TODO #7273 use MovieService instead once Akita has been replaced by ng-fire (currently using MovieService results in error)
      const ref = doc(this.db, `movies/${id}`);
      const document = await getDoc(ref);
      const title = createMovie(document.data());

      meta = createTitleMeta({
        titleId: id,
        orgId: profile.orgId,
        uid: profile.uid,
        ownerOrgIds: title.orgIds
      });
    }
    if (!meta) return;

    return this.add({ name: 'pageView', type, meta });
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
