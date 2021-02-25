import { Component, ChangeDetectionStrategy, OnInit, Input } from '@angular/core';
import { AuthQuery } from '@blockframes/auth/+state';
import { Organization } from '@blockframes/organization/+state';
import { getCurrentApp } from '@blockframes/utils/apps';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'auth-data-validation',
  templateUrl: './data-validation.component.html',
  styleUrls: ['./data-validation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthDataValidation implements OnInit {
  @Input() organization: Organization;
  public app = getCurrentApp(this.routerQuery);
  public profileData = false;
  public orgData = false;
  public emailValidate$: Observable<boolean>;
  public orgApproval = false;

  public user = this.query.user;

  constructor(private query: AuthQuery, private routerQuery: RouterQuery) {}

  ngOnInit() {
    //! problème avec l'org à cause du fait qu'on est connecté
    //! mais on n'a pas d'org donc pas moyen d'accéder au document de l'org dans firebase ?
    // Filled checkbox
    if (!!this.user.firstName && !!this.user.lastName && !!this.user.email) this.profileData = true;
    if (!!this.organization && !!this.organization.denomination.full) this.orgData = true;
    if(
      (this.organization.appAccess[this.app].dashboard || this.organization.appAccess[this.app].marketplace)
      && this.organization.userIds.includes(this.user.uid)
      ) {
      this.orgApproval = true;
    }
    this.emailValidate$ = this.query.hasVerifiedEmail$;
  }
}
