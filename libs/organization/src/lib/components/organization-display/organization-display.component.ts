import { ChangeDetectionStrategy, Component, EventEmitter, Output, Input, HostBinding } from '@angular/core';
import { Organization } from '../../+state';
import { OrganizationForm } from '../../forms/organization.form';
import { PLACEHOLDER_LOGO } from '../../+state/organization.model'

@Component({
  selector: 'organization-display',
  templateUrl: './organization-display.component.html',
  styleUrls: ['./organization-display.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationDisplayComponent {
  @HostBinding('attr.page-id') pageId = 'organization-display';
  public placeholderUrl = PLACEHOLDER_LOGO;

  @Output() editing = new EventEmitter<void>();
  @Input() opened: boolean;
  @Input() organization: Organization;
  @Input() organizationInformations: OrganizationForm;
  @Input() isAdmin: boolean;

  get layout() {
    return this.opened ? 'column' : 'row';
  }
}
