import { Component, ChangeDetectionStrategy } from '@angular/core';
import { PermissionsQuery } from '@blockframes/organization/permissions/+state';
import { OrganizationService, OrganizationQuery } from '@blockframes/organization/+state';
import { Router } from '@angular/router';

@Component({
  selector: 'activate-dao',
  templateUrl: './activate-dao.component.html',
  styleUrls: ['./activate-dao.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivateDaoComponent {

  isSuperAdmin$ = this.permissionsQuery.isSuperAdmin$;

  constructor(
    private permissionsQuery: PermissionsQuery,
    private query: OrganizationQuery,
    private service: OrganizationService,
    private router: Router,
  ) {}

  async activate() {
    const orgId = this.query.getActiveId();
    await this.service.setBlockchainFeature(true);
    this.router.navigateByUrl(`/layout/o/organization/${orgId}/dao`);
  }
}
