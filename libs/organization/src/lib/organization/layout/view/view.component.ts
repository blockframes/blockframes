import { Component, ChangeDetectionStrategy, Input, HostBinding } from '@angular/core';
import { Organization } from '@blockframes/organization/+state';
import { fade } from '@blockframes/utils/animations/fade';
import { Location } from '@angular/common';

@Component({
  selector: 'org-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  animations: [fade],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewComponent {
  @HostBinding('@fade') animation = true;
  @Input() navLinks;
  @Input() org: Organization;

  constructor(private location: Location) { }

  goBack() {
    this.location.back();
  }

}
