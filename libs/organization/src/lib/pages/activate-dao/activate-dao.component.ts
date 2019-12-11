import { Component, ChangeDetectionStrategy } from '@angular/core';
import { PermissionsQuery } from '@blockframes/organization/permissions/+state';
import { OrganizationService, OrganizationQuery } from '@blockframes/organization/+state';
import { Router, ActivatedRoute  } from '@angular/router';

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
    private service: OrganizationService,
    private router: Router,
    private routes: ActivatedRoute,
  ) {}

  async activate() {
    await this.service.setBlockchainFeature(true);
    this.router.navigate(['../dao'], {relativeTo: this.routes});
  }
}
