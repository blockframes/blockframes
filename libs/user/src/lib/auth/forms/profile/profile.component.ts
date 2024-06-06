import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { ProfileForm } from '../../forms/profile-edit.form';
import { AuthService } from '../../service';

@Component({
  selector: '[form] auth-form-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileFormComponent {
  public uid = this.authService.uid;

  @Input() form: ProfileForm;

  constructor(public authService: AuthService) {}

}
