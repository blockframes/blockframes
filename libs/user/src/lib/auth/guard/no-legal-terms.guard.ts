import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../service';
import { map, switchMap } from 'rxjs/operators';
import { App } from '@blockframes/model';
import { APP } from '@blockframes/utils/routes/utils';

@Injectable({
  providedIn: 'root'
})
export class NoLegalTermsGuard {

  constructor(
    private router: Router,
    private service: AuthService,
    @Inject(APP) private app: App
  ) { }

  canActivate() {
    return this.service.profile$.pipe(
      switchMap(() => this.service.getValue()),
      map(user => {
        if (this.app === 'crm') return this.router.createUrlTree(['/c/o']);

        const latestPrivacyPolicy = this.service.privacyPolicyDate;
        const latestTermsAndConditions = this.service.termsAndConditionsDate[this.app];
        const userPrivacyPolicy = user.privacyPolicy?.date;
        const userTermsAndConditions = user.termsAndConditions?.[this.app]?.date;

        const invalidPrivacyPolicy = !userPrivacyPolicy || userPrivacyPolicy < latestPrivacyPolicy;
        const invalidTermsAndConditions = !userTermsAndConditions || userTermsAndConditions < latestTermsAndConditions;

        if (invalidPrivacyPolicy || invalidTermsAndConditions) return true;
        return this.router.createUrlTree(['/c/o']);
      })
    );
  }
}