import { Component, ChangeDetectionStrategy, OnInit, HostBinding } from '@angular/core';
import { AuthQuery, AuthService } from '@blockframes/auth';
import { ProfileForm } from '../../forms/profile-edit.form';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup } from '@angular/forms';
import { PasswordControl } from '@blockframes/utils';
import { OrganizationQuery, Organization } from '@blockframes/organization';
import { startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'profile-editable',
  templateUrl: './profile-editable.component.html',
  styleUrls: ['./profile-editable.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileEditableComponent implements OnInit {
  @HostBinding('attr.page-id') pageId = 'profile-editable';

  public opened = false;
  public editContent = 'profile';
  public profileForm: ProfileForm;
  public editPasswordForm = new FormGroup({
    current: new PasswordControl(),
    next: new PasswordControl()
  });
  public organization$: Observable<Organization>;
  public userEmail: string;

  constructor(
    private authQuery: AuthQuery,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private organizationQuery: OrganizationQuery
  ) {}

  ngOnInit() {
    const user = this.authQuery.user;
    this.userEmail = user.email;
    this.profileForm = new ProfileForm(user);
    this.organization$ = this.organizationQuery.selectActive();
  }

  public update() {
    try {
      switch (this.editContent) {
        case 'profile':
          if (this.profileForm.invalid) throw new Error('Your profile informations are not valid');
          this.authService.update(this.profileForm.value);
          this.snackBar.open('Profile change succesfull', 'close', { duration: 2000 });
          break;
        case 'password':
          if (this.editPasswordForm.invalid) throw new Error('Your informations for change your password are not valid');
          const { current, next } = this.editPasswordForm.value;
          this.authService.updatePassword(current, next);
          this.snackBar.open('Password change succesfull', 'close', { duration: 2000 });
          break;
      }
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }

  public openSidenav(name: string) {
    this.editContent = name;
    this.opened = true;
  }

  public get user$() {
    return this.profileForm.valueChanges.pipe(
      startWith(this.profileForm.value),
    );
  }
}
