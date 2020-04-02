import { Component, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { pluck, switchMap } from 'rxjs/operators';
import { OrganizationService } from '@blockframes/organization/organization/+state/organization.service';
import { scaleIn } from '@blockframes/utils/animations/fade';

const navLinks = [{
  path: 'title',
  label: 'Line-up'
}, {
  path: 'event',
  label: 'Screenings Agenda'
}, {
  path: 'member',
  label: 'Contacts'
}];

@Component({
  selector: 'festival-marketplace-organization-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  animations: [scaleIn],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewComponent {
  @HostBinding('@scaleIn') animation = true;
  // Cannot use Guard Active + selectActive as the active organization is the one from the user
  org$ = this.route.params.pipe(
    pluck('orgId'),
    switchMap((orgId: string) => this.service.getValue(orgId))
  );

  navLinks = navLinks;

  constructor(
    private service: OrganizationService,
    private route: ActivatedRoute
  ) { }

}
