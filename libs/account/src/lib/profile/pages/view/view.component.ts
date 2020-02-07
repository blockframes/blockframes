import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { Observable, Subscription } from 'rxjs';
import { Organization } from '@blockframes/organization/+state/organization.model';
import { TunnelService } from '@blockframes/ui/tunnel';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '@blockframes/auth/+state/auth.service';
import { ProfileForm } from '@blockframes/account/profile/forms/profile-edit.form';
import { EditPasswordForm } from '@blockframes/utils/form/controls/password.control';
import { User } from '@blockframes/auth';
@Component({
  selector: 'profile-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileViewComponent implements OnInit {
  public organization$: Observable<Organization>;
  public previousPage: string;
  public profileForm: ProfileForm;
  public passwordForm = new EditPasswordForm();
  public user$: Observable<User>;

  constructor(
    private authQuery: AuthQuery,
    private organizationQuery: OrganizationQuery,
    private tunnelService: TunnelService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.user$ = this.authQuery.user$;
    this.profileForm = new ProfileForm(this.authQuery.user)
    this.organization$ = this.organizationQuery.selectActive();
    this.previousPage = this.tunnelService.previousUrl;
  }

  public update() {
    try {
    // update profile
    if (this.profileForm.touched) {
      if (this.profileForm.invalid) throw new Error('Your profile informations are not valid');
      const uid = this.authQuery.userId;
      const user = this.profileForm.value;
      this.authService.update({uid, ...user});
    }
    // update password
    if(this.passwordForm.dirty) {
      if (this.passwordForm.invalid) throw new Error('Your informations for change your password are not valid');
      const { current, next } = this.passwordForm.value;
      this.authService.updatePassword(current, next);
      this.snackBar.open('Password change succesfull', 'close', { duration: 2000 });
    }
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }

}
