import { ChangeDetectionStrategy, Component, EventEmitter, Output, Input, HostBinding } from '@angular/core';
import { Organization } from '../../+state';
import { OrganizationProfile } from '../../forms/organization-profile-edit-form';

@Component({
  selector: 'organization-display',
  templateUrl: './organization-display.component.html',
  styleUrls: ['./organization-display.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationDisplayComponent {
  @HostBinding('attr.page-id') pageId = 'organization-display';

  @Output() editing = new EventEmitter<void>();
  @Input() opened: boolean;
  @Input() organization: Organization;
  @Input() organizationInformations: OrganizationProfile;
  @Input() isSuperAdmin: boolean;

  get layout() {
    return this.opened ? 'column' : 'row';
  }
}
