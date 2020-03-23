import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'organization-home',
  templateUrl: './organization-home.component.html',
  styleUrls: ['./organization-home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationHomeComponent {
  @HostBinding('attr.page-id') pageId = 'organization-home';

  public link = new FormControl();

  constructor() {}

  get routerLink() {
    return this.link.value ? ['..', this.link.value] : '.';
  }

}
