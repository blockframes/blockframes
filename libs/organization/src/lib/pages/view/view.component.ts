import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { Organization } from '@blockframes/organization/+state/organization.model';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { TunnelService } from '@blockframes/ui/tunnel/tunnel.service';

const   navLinks = [{
  path: 'org',
  label: 'Organization'
}, {
  path: 'member',
  label: 'Members'
}];

@Component({
  selector: 'organization-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationViewComponent implements OnInit {
  public organization$: Observable<Organization>;
  public previousPage: string;
  public placeholderLogo = 'Organization_250.png';
  public navLinks = navLinks;

  constructor(
    private organizationQuery: OrganizationQuery,
    private tunnelService: TunnelService
  ) { }

  ngOnInit() {
    this.organization$ = this.organizationQuery.selectActive();
    this.previousPage = this.tunnelService.previousUrl;
  }

}
