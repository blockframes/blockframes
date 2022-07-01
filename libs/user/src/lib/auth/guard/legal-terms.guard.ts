import { Inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../service';
import { map, switchMap } from 'rxjs/operators';
import { App } from '@blockframes/model';
import { APP } from '@blockframes/utils/routes/utils';

@Injectable({
  providedIn: 'root'
})
export class LegalTermsGuard implements CanActivate  {

  constructor(
    private router: Router,
    private service: AuthService,
    @Inject(APP) private app: App
  ) { }

  canActivate() {
    return this.service.profile$.pipe(
      switchMap(() => this.service.getValue()),
      map(user  => {
        if (
          this.app !== 'crm' && (
          !user.privacyPolicy?.date || 
          user.privacyPolicy?.date < this.service.privacyPolicyDate ||
          !user.termsAndConditions?.[this.app]?.date ||
          user.termsAndConditions?.[this.app]?.date < this.service.termsAndConditionsDate[this.app])
          ) {
          return this.router.createUrlTree(['/auth/checkPrivacyAndTerms']);
        }
        return true;
      })
    );
  }
}