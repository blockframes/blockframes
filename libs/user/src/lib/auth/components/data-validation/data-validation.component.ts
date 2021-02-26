import { Component, ChangeDetectionStrategy, OnInit, Input, Optional } from '@angular/core';
import { AuthQuery } from '@blockframes/auth/+state';
import { Organization } from '@blockframes/organization/+state';
import { getCurrentApp, appName } from '@blockframes/utils/apps';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { Observable } from 'rxjs';
import { Intercom } from 'ng-intercom';

@Component({
  selector: 'auth-data-validation',
  templateUrl: './data-validation.component.html',
  styleUrls: ['./data-validation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthDataValidation implements OnInit {
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
    @Optional() private intercom: Intercom) {}

  ngOnInit() {
    // Filled checkbox
    if (!!this.user.firstName && !!this.user.lastName && !!this.user.email) this.profileData = true;
    if (!!this.organization && !!this.organization.denomination.full) this.orgData = true;
    if(
      this.organization.status === "accepted"
      && (this.organization.appAccess[this.app].dashboard || this.organization.appAccess[this.app].marketplace)
      && this.organization.userIds.includes(this.user.uid)
      ) {
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
