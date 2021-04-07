import { Component, ChangeDetectionStrategy, Input, HostBinding } from '@angular/core';
import { Organization } from '@blockframes/organization/+state';
import { fade } from '@blockframes/utils/animations/fade';

@Component({
  selector: 'org-chip',
  templateUrl: './chip.component.html',
  styleUrls: ['./chip.component.scss'],
  animations: [fade],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChipComponent {
  @HostBinding('@fade') animation = true;

  @Input() org: Organization;

}
