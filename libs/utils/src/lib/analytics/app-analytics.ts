import { isSupported, setUserId, logEvent, setUserProperties, Analytics } from 'firebase/analytics';
import { Inject, Injectable, OnDestroy } from '@angular/core';
import { EventName, AnalyticsUserProperties } from '@blockframes/model';
import { centralOrgId } from '@env';
import { AuthService } from '@blockframes/auth/+state';
import { take } from 'rxjs/operators';
import { FIRE_ANALYTICS } from 'ngfire';
import { Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FireAnalytics implements OnDestroy {
  private subscription?: Subscription

  constructor(
    @Inject(FIRE_ANALYTICS) private analytics: Analytics,
    private authService: AuthService,
  ) {
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

  public async event(name: EventName, params: Record<string, unknown>) {
    const isBlockframesAdmin = await this.authService.isBlockframesAdmin$.pipe(take(1)).toPromise();
    const profile = await this.authService.profile$.pipe(take(1)).toPromise();
    const isOperator = isBlockframesAdmin || Object.values(centralOrgId).includes(profile?.orgId);

    /**
     * @dev We do not want to log centralOrg operators nor blockframes
     * admins actions on the platform.
     */
    if (profile?.uid && profile?.orgId && isOperator) return false;
    logEvent(this.analytics, name, { ...params, uid: profile?.uid });
  }

  public setUserProperties(properties: Partial<AnalyticsUserProperties>) {
    setUserProperties(this.analytics, properties);
  }
}
