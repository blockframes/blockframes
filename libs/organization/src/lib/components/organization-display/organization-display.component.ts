import { ChangeDetectionStrategy, Component, EventEmitter, Output, Input } from '@angular/core';
import { Organization } from '../../+state';
import { OrganizationProfile } from '../../forms/organization-profile-edit-form';

@Component({
  selector: 'organization-display',
  templateUrl: './organization-display.component.html',
  styleUrls: ['./organization-display.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationDisplayComponent {
  @Output() editing = new EventEmitter<void>();
  @Input() organization: Organization;
  @Input() organizationInformations: OrganizationProfile;
  @Input() isSuperAdmin: boolean;
}
