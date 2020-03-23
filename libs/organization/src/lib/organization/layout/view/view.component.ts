import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { Organization } from '@blockframes/organization/organization/+state';

@Component({
  selector: 'org-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewComponent {
  @Input() navLinks;
  @Input() org: Organization;

  constructor() { }

}
