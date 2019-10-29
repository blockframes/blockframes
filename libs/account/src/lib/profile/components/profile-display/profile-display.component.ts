
import { Component, ChangeDetectionStrategy, Output, EventEmitter, Input, HostBinding } from '@angular/core';
import { Organization } from '@blockframes/organization';
import { Profile } from '../../forms/profile-edit.form';

@Component({
  selector: 'profile-display',
  templateUrl: './profile-display.component.html',
  styleUrls: ['./profile-display.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileDisplayComponent {
  @HostBinding('attr.page-id') pageId = 'profile-display';

  public placeholderUrl = '/assets/logo/profil_avatar_250.svg';
  public email: string;
  @Output() editing = new EventEmitter<string>();
  @Input() opened: boolean;
  @Input() user: Profile;
  @Input() userEmail: string;
  @Input() organization: Organization;

  get layout() {
    return this.opened ? 'column' : 'row';
  }
}
