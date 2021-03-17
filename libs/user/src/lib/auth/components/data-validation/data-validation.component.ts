import { Component, ChangeDetectionStrategy, OnInit, Input, Optional } from '@angular/core';
import { AuthQuery } from '@blockframes/auth/+state';
import { Organization } from '@blockframes/organization/+state';
import { getCurrentApp, appName, getOrgModuleAccess } from '@blockframes/utils/apps';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { Observable } from 'rxjs';
import { Intercom } from 'ng-intercom';
import { hasDenomination, hasDisplayName } from '@blockframes/utils/helpers';

@Component({
  selector: 'auth-data-validation',
  templateUrl: './data-validation.component.html',
  styleUrls: ['./data-validation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthDataValidationComponent implements OnInit {
  @Input() organization: Organization;
  public app = getCurrentApp(this.routerQuery);
  public appName = appName[this.app];
  public profileData = false;
  public orgData = false;
  public emailValidate$: Observable<boolean>;
  public orgApproval = false;

  public user = this.query.user;

  constructor(
    private query: AuthQuery,
    private routerQuery: RouterQuery,
    @Optional() private intercom: Intercom) { }

  ngOnInit() {
    // Filled checkbox

    if (hasDisplayName(this.user) && !!this.user.email) {
      this.profileData = true;
    }

    if (hasDenomination(this.organization)) {
      this.orgData = true;
    }

    const isUserInOrg = this.organization.userIds.includes(this.user.uid);
    const isOrgAccepted = this.organization.status === "accepted";
    const orgHaveAccesToAtLeastOneModule = getOrgModuleAccess(this.organization, this.app).length ? true : false;

    if (isOrgAccepted && orgHaveAccesToAtLeastOneModule && isUserInOrg) {
      this.orgApproval = true;
    }

    this.emailValidate$ = this.query.hasVerifiedEmail$;
  }

  openIntercom(): void {
    return this.intercom.show();
  }

  refresh() {
    window.location.reload();
  }
}
