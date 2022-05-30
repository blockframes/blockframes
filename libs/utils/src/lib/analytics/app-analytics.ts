import { isSupported, setUserId, logEvent, setUserProperties, Analytics } from 'firebase/analytics';
import { Inject, Injectable, OnDestroy } from '@angular/core';
import { EventName, AnalyticsUserProperties } from '@blockframes/model';
import { centralOrgId } from '@env';
import { AuthService } from '@blockframes/auth/service';
import { FIRE_ANALYTICS } from 'ngfire';
import { firstValueFrom, Subscription } from 'rxjs';

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
    const isBlockframesAdmin = await firstValueFrom(this.authService.isBlockframesAdmin$);
    const profile = await firstValueFrom(this.authService.profile$);
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
