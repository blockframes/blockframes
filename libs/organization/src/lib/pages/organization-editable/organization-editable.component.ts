
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'organization-editable',
  templateUrl: './organization-editable.component.html',
  styleUrls: ['./organization-editable.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationEditableComponent {
  public opened = false;

  public openSidenav() {
    this.opened = true;
  }
}
