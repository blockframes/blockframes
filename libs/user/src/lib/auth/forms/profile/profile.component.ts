import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { ProfileForm } from '@blockframes/auth/forms/profile-edit.form';
import { AuthService } from '@blockframes/auth/+state';

@Component({
  selector: '[form] auth-form-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileFormComponent {
  public uid = this.authService.profile.uid;

  @Input() form: ProfileForm;

  constructor(public authService: AuthService) {}

}
