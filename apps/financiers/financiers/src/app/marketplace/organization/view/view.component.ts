import { Component, ChangeDetectionStrategy, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { pluck, switchMap } from 'rxjs/operators';
import { OrganizationService } from '@blockframes/organization/service';
import { scrollIntoView } from '@blockframes/utils/browser/utils';

const navLinks = [{
  path: 'title',
  label: 'Line-up'
},  {
  path: 'member',
  label: 'Contact'
}];

@Component({
  selector: 'financiers-marketplace-organization-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewComponent implements AfterViewInit {
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

  ngAfterViewInit(): void {
    setTimeout(() => {
      scrollIntoView(document.querySelector('#top'));
    });
  }
}
