import { ChangeDetectionStrategy, Component, EventEmitter, Output, Input } from '@angular/core';
import { OrganizationForm } from '../../forms/organization.form';
import { Organization, PLACEHOLDER_LOGO } from '@blockframes/model';

@Component({
  selector: 'organization-display',
  templateUrl: './organization-display.component.html',
  styleUrls: ['./organization-display.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationDisplayComponent {
  public placeholderUrl = PLACEHOLDER_LOGO;

  @Output() editing = new EventEmitter<void>();
  @Input() opened: boolean;
  @Input() organization: Organization;
  @Input() organizationInformations: OrganizationForm;
  @Input() isAdmin: boolean;

  get layout() {
    return this.opened ? 'column' : 'row';
  }

  get org() {
    return this.organizationInformations
      ? this.organizationInformations.value
      : this.organization;
  }
}
