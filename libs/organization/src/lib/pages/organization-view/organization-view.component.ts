import { ChangeDetectionStrategy, Component, OnInit, EventEmitter, Output } from '@angular/core';
import { Organization, OrganizationQuery } from '../../+state';
import { Observable } from 'rxjs';
import { PermissionsQuery } from '../../permissions/+state';

@Component({
  selector: 'organization-view',
  templateUrl: './organization-view.component.html',
  styleUrls: ['./organization-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationViewComponent implements OnInit {
  @Output() editing = new EventEmitter<void>();
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
