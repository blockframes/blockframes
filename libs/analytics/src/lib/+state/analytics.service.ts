import { Injectable } from '@angular/core';
import { ActiveState, EntityState } from '@datorama/akita';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { Analytics, AnalyticsTypes } from './analytics.firestore';
import { toDate } from '@blockframes/utils/helpers';
import { OrganizationService } from '@blockframes/organization/+state';
import { QueryFn } from '@angular/fire/firestore';
import { formatDocumentMetaFromFirestore } from '@blockframes/utils/models-meta';

interface AnalyticsState extends EntityState<Analytics>, ActiveState<string> {};

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'analytics' })
export class AnalyticsService extends CollectionService<AnalyticsState> {
  readonly useMemorization = true;

  constructor(private orgService: OrganizationService) {
    super();
  }

  formatFromFirestore(analytic): Analytics<AnalyticsTypes> {
    return {
      ...analytic,
      _meta: formatDocumentMetaFromFirestore(analytic._meta)
    };
  }

  getTitleAnalytics(titleId: string) {
    return this.valueChanges(ref => ref
      .where('type', '==', 'title')
      .where('meta.titleId', '==', titleId)
      .where('meta.ownerOrgIds', 'array-contains', this.orgService.org.id)
    );
  }
}
