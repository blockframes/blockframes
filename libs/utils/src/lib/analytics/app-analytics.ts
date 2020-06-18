import { AngularFireAnalytics } from '@angular/fire/analytics';
import { Injectable } from '@angular/core';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { AnalyticsEvents } from './analyticsEvents';
import { centralOrgID } from '@env';
import { GDPRService } from '../gdpr-cookie/gdpr-service/gdpr-service';

@Injectable({ providedIn: 'root' })
export class FireAnalytics extends GDPRService {
  constructor(
    public analytics: AngularFireAnalytics,
    private authQuery: AuthQuery,
  ) {
    super('c8-gdpr-google-analytics');
  }

  public event(name: AnalyticsEvents, params: Record<string, any>) {

    if (!this.gdprIsEnabled) return;

    console.log('GA', name);

    const { user, orgId, isBlockframesAdmin } = this.authQuery;
    const isOperator = isBlockframesAdmin || orgId === centralOrgID;
    if (user && orgId && isOperator) {
      /**
       * @dev We do not want to log centralOrg operators nor blockframes
       * admins actions on the platform.
       */
      return false;
    }

    try {
      this.analytics.logEvent(name, { ...params, uid: this.authQuery.userId });
    } catch {
      this.analytics.logEvent(name, { ...params });
    }
  }
}
