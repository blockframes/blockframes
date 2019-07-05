import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Organization, OrganizationQuery } from '../../+state';
import { PermissionsQuery } from '../../permissions/+state';

@Component({
  selector: 'org-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.scss']
})
export class MemberListComponent implements OnInit {
  public org$: Observable<Organization>;
  public isSuperAdmin$: Observable<boolean>;

  constructor(private query: OrganizationQuery, private permissionsQuery: PermissionsQuery) {}

  ngOnInit() {
    this.org$ = this.query.select('org');
    this.isSuperAdmin$ = this.permissionsQuery.isSuperAdmin$;
  }
}
