import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { Observable } from 'rxjs';
import { Organization } from '@blockframes/organization/+state/organization.model';
import { TunnelService } from '@blockframes/ui/tunnel';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '@blockframes/auth/+state/auth.service';
import { ProfileForm } from '@blockframes/account/profile/forms/profile-edit.form';

@Component({
  selector: 'profile-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileViewComponent implements OnInit {
  public organization$: Observable<Organization>;
  public placeholderAvatar = 'Avatar_250.png';
  public previousPage: string;

  constructor(
    private authQuery: AuthQuery,
    private organizationQuery: OrganizationQuery,
    private tunnelService: TunnelService,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private form: ProfileForm
  ) { }

  ngOnInit() {
    const user = this.authQuery.user;
    this.organization$ = this.organizationQuery.selectActive();
    this.previousPage = this.tunnelService.previousUrl;
  }

  public get user() {
    return this.form.patchValue;
  }

}
