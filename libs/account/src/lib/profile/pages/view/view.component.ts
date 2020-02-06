import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { Observable } from 'rxjs';
import { Organization } from '@blockframes/organization/+state/organization.model';
import { startWith } from 'rxjs/internal/operators/startWith';
import { ProfileForm } from '../../forms/profile-edit.form';
import { TunnelService } from '@blockframes/ui/tunnel';
import { FormGroup } from '@angular/forms';
import { PasswordControl } from '@blockframes/utils';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '@blockframes/auth/+state/auth.service';

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
  public profileForm: ProfileForm;
  public editPasswordForm = new FormGroup({
    current: new PasswordControl(),
    next: new PasswordControl()
  });

  constructor(
    private authQuery: AuthQuery,
    private organizationQuery: OrganizationQuery,
    private tunnelService: TunnelService,
    private snackBar: MatSnackBar,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    const user = this.authQuery.user;
    this.profileForm = new ProfileForm(user);
    this.organization$ = this.organizationQuery.selectActive();
    this.previousPage = this.tunnelService.previousUrl;
  }

  public get user$() {
    return this.profileForm.valueChanges.pipe(
      startWith(this.profileForm.value),
    );
  }

  public update() {
    try {
          if (this.profileForm.invalid) throw new Error('Your profile informations are not valid');
          this.authService.update(this.profileForm.value);
          this.snackBar.open('Profile change succesfull', 'close', { duration: 2000 });
          if (this.editPasswordForm.invalid) throw new Error('Your informations for change your password are not valid');
          const { current, next } = this.editPasswordForm.value;
          this.authService.updatePassword(current, next);
          this.snackBar.open('Password change succesfull', 'close', { duration: 2000 });
      }
    catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }

}
