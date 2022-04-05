import { AngularFireAnalytics } from '@angular/fire/analytics';
import { Injectable } from '@angular/core';
import { EventName, AnalyticsUserProperties } from '@blockframes/model';
import { centralOrgId } from '@env';
import { AuthService } from '@blockframes/auth/+state';
import { take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class FireAnalytics {
  constructor(
    public analytics: AngularFireAnalytics,
    private authService: AuthService,
  ) { }

  public async event(name: EventName, params: Record<string, unknown>) {
    const isBlockframesAdmin = await this.authService.isBlockframesAdmin$.pipe(take(1)).toPromise();
    const profile = await this.authService.profile$.pipe(take(1)).toPromise();
    const isOperator = isBlockframesAdmin || Object.values(centralOrgId).includes(profile?.orgId);

    /**
     * @dev We do not want to log centralOrg operators nor blockframes
     * admins actions on the platform.
     */
    if (profile?.uid && profile?.orgId && isOperator) return false;
    this.analytics.logEvent(name, { ...params, uid: profile?.uid });
  }

  public setUserProperties(properties: Partial<AnalyticsUserProperties>) {
    this.analytics.setUserProperties(properties);
  }
}
