import { Component, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { scaleOut } from '@blockframes/utils/animations/fade';
import { Observable } from 'rxjs';
import { Organization } from '@blockframes/organization/+state';
import { map } from 'rxjs/operators';
import { centralOrgID } from '@env';

@Component({
  selector: 'festival-organization-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  animations: [scaleOut],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent {
  @HostBinding('@scaleOut') animation = true;
  orgs$: Observable<Organization[]>;

  constructor(private service: OrganizationService) {
    this.orgs$ = this.service
      .valueChanges(ref => ref.where('appAccess.festival.dashboard', '==', true))
      .pipe(map(orgs => orgs.filter(org => org.id !== centralOrgID)));
  }
}
