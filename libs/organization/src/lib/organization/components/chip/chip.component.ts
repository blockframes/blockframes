import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Organization } from '@blockframes/organization/+state';

@Component({
  selector: 'org-chip',
  templateUrl: './chip.component.html',
  styleUrls: ['./chip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChipComponent {
  @Input() org: Organization;
  @Input() baseUrl = '/c/o/marketplace/organization';
}
