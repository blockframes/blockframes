import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { ProfileForm } from '@blockframes/auth/forms/profile-edit.form';
import { AuthQuery } from '@blockframes/auth/+state';
import { HostedMediaForm } from '@blockframes/media/form/media.form';
@Component({
  selector: '[form] auth-form-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileFormComponent {
  public uid = this.authQuery.userId;

  @Input() form: ProfileForm;

  constructor(private authQuery: AuthQuery){}
}
