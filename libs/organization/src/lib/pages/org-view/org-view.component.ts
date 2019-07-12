import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Organization, OrganizationQuery } from '../../+state';
import { Observable } from 'rxjs';
import { PermissionsQuery } from '../../permissions/+state';

@Component({
  selector: 'org-view',
  templateUrl: './org-view.component.html',
  styleUrls: ['./org-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrgViewComponent implements OnInit {
  public organization$: Observable<Organization>;
  public isSuperAdmin$: Observable<boolean>;

  constructor(
    private query: OrganizationQuery,
    private permissionsQuery: PermissionsQuery,
  ) {
  }

  ngOnInit() {
    this.organization$ = this.query.select('org');
    this.isSuperAdmin$ = this.permissionsQuery.isSuperAdmin$;
  }

}
