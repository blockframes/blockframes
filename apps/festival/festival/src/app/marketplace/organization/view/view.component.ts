import { Component, ChangeDetectionStrategy } from '@angular/core';
import { OrganizationService } from '@blockframes/organization';
import { ActivatedRoute } from '@angular/router';
import { pluck, switchMap } from 'rxjs/operators';

const navLinks = [{
  path: 'titles',
  label: 'Line-up'
}, {
  path: 'members',
  label: 'Contacts'
}];

@Component({
  selector: 'festival-marketplace-organization-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewComponent {

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
