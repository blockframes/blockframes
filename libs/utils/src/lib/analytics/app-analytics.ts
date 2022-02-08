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

  public async event(name: AnalyticsEvents, params: Record<string, unknown>) {
    const isBlockframesAdmin = await this.authService.isBlockframesAdmin$.pipe(take(1)).toPromise();
    const auth = await this.authService.auth$.pipe(take(1)).toPromise();
    const isOperator = isBlockframesAdmin || Object.values(centralOrgId).includes(auth?.profile?.orgId);

    /**
     * @dev We do not want to log centralOrg operators nor blockframes
     * admins actions on the platform.
     */
    if (auth?.uid && auth?.profile?.orgId && isOperator) return false;
    this.analytics.logEvent(name, { ...params, uid: auth?.uid });
  }

  public setUserProperties(properties: Partial<AnalyticsUserProperties>) {
    this.analytics.setUserProperties(properties);
  }
}
