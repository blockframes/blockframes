import { AngularFireAnalytics } from '@angular/fire/analytics';
import { Injectable } from '@angular/core';
import { AnalyticsEvents, AnalyticsUserProperties } from './analytics-model';
import { centralOrgId } from '@env';
import { AuthService } from '@blockframes/auth/+state';
import { take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class FireAnalytics {
  constructor(
    public analytics: AngularFireAnalytics,
    private authService: AuthService,
  ) { }

  public event(name: AnalyticsEvents, params: Record<string, unknown>) {
    const { uid, orgId } = this.authService.profile;
    this.authService.isBlockframesAdmin$.pipe(take(1)).toPromise().then(isBlockframesAdmin => {
      const isOperator = isBlockframesAdmin || Object.values(centralOrgId).includes(orgId);
      if (uid && orgId && isOperator) {
        /**
         * @dev We do not want to log centralOrg operators nor blockframes
         * admins actions on the platform.
         */
        return false;
      }

      try {
        this.analytics.logEvent(name, { ...params, uid }); // @TODO #7286 check that this is working
      } catch {
        this.analytics.logEvent(name, { ...params });
      }
    }); // @TODO #7286 check that this is working
  }

  public setUserProperties(properties: Partial<AnalyticsUserProperties>) {
    this.analytics.setUserProperties(properties);
  }
}
