import { Component, OnInit, ChangeDetectionStrategy, Input, HostBinding } from '@angular/core';
import { Organization } from '@blockframes/organization/+state';
import { fade } from '@blockframes/utils/animations/fade';

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

  constructor() { }

}
