import { Component, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { PLACEHOLDER_AVATAR } from '@blockframes/auth';

@Component({
  selector: '[formGroupName] profile-form, [formGroup] profile-form, profile-form',
  templateUrl: './profile-form.component.html',
  styleUrls: ['./profile-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileFormComponent {
  @HostBinding('attr.page-id') pageId = 'profile-form';

  constructor(public controlContainer: ControlContainer) {}

  public get control() {
    return this.controlContainer.control;
  }

  public get avatar() {
    return this.control.get('avatar').value;
  }

  public set avatar(avatarPath: string | undefined) {
    this.control.get('avatar').patchValue(avatarPath || PLACEHOLDER_AVATAR);
  }
}
