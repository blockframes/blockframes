import { Component, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { scaleOut, scaleOutList } from '@blockframes/utils/animations/fade';
import { Observable } from 'rxjs';

@Component({
  selector: 'festival-marketplace-organization-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  animations: [scaleOut, scaleOutList('a')],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent {
  @HostBinding('@scaleOut') animation = true;
  // @HostBinding('@scaleOutList') animList = true;
  organizations;

  constructor(private service: OrganizationService) {
    // TODO #2570
    this.organizations = this.service.getValue(ref => ref.where('appAccess.festival.dashboard', '==', 'true'));
  }

}
