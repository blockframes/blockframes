import { Injectable } from '@angular/core';
import { AngularFireAnalytics } from '@angular/fire/analytics';
import { ActiveState, EntityState } from '@datorama/akita';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { take } from 'rxjs/operators';
import { format } from 'date-fns';
import { centralOrgId } from '@env';
import { Analytics, AnalyticsTypeRecord, AnalyticsTypes, EventName } from './analytics.firestore';
import { createTitleMeta } from './analytics.model';
import { AuthService } from '@blockframes/auth/+state';
import { createMovie } from '@blockframes/movie/+state';
import { createDocumentMeta } from '@blockframes/utils/models-meta';
import { AppGuard } from '@blockframes/utils/routes/app.guard';
import { formatDocumentMetaFromFirestore } from '@blockframes/utils/models-meta';

interface AnalyticsState extends EntityState<Analytics>, ActiveState<string> {};

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'analytics' })
export class AnalyticsService extends CollectionService<AnalyticsState> {
  readonly useMemorization = true;

  constructor(
    private analytics: AngularFireAnalytics,
    private authService: AuthService,
    private appGuard: AppGuard
  ) {
    super();
  }

  formatFromFirestore(analytic): Analytics<AnalyticsTypes> {
    return {
      ...analytic,
      _meta: formatDocumentMetaFromFirestore(analytic._meta)
    };
  }

  getTitleAnalytics(titleId: string) {
    const { orgId } = this.authService.profile;
    return this.valueChanges(ref => ref
      .where('type', '==', 'title')
      .where('meta.titleId', '==', titleId)
      .where('meta.ownerOrgIds', 'array-contains', orgId)
    );
  }

  async addTitleEvent(name: EventName, titleId: string) {
    if (await this.isOperator()) return;

    const profile = this.authService.profile;

    // // TODO use MovieService instead once Akita has been replaced by ng-fire (currently using MovieService results in error) 
    const doc = await this.db.doc(`movies/${titleId}`).ref.get();
    const title = createMovie(doc.data());

    const meta = createTitleMeta({
      titleId,
      orgId: profile.orgId,
      uid: profile.uid,
      ownerOrgIds: title.orgIds
    });

    this.analytics.logEvent(name, meta);
    return this.add({
      type: 'title',
      name,
      meta,
      _meta: createDocumentMeta({ createdFrom: this.appGuard.currentApp, createdBy: profile.uid })
    });
  }

  async addPageViewEvent(type: AnalyticsTypes, id: string) {
    if (await this.isOperator()) return;

    // unique per day
    const date = format(new Date(), 'yyyyMMdd');
    const key = `${date}${type}${id}`;

    const pageVisits: Record<string, boolean> = JSON.parse(localStorage.getItem('pageVisits')) || {};
    if (pageVisits[key]) return;
    pageVisits[key] = true;
    localStorage.setItem('pageVisits', JSON.stringify(pageVisits));

    const profile = this.authService.profile;

    let meta: AnalyticsTypeRecord[AnalyticsTypes];
    if (type === 'title') {
      // TODO use MovieService instead once Akita has been replaced by ng-fire (currently using MovieService results in error) 
      const doc = await this.db.doc(`movies/${id}`).ref.get();
      const title = createMovie(doc.data());

      meta = createTitleMeta({
        titleId: id,
        orgId: profile.orgId,
        uid: profile.uid,
        ownerOrgIds: title.orgIds
      });
    }
    if (!meta) return;

    return this.add({
      id: key,
      type,
      name: 'pageView',
      meta,
      _meta: createDocumentMeta({ createdFrom: this.appGuard.currentApp, createdBy: profile.uid })
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
    const isOperator = isBlockframesAdmin || isConcierge || Object.values(centralOrgId).includes(profile?.orgId);
    return isOperator;
  }
}
