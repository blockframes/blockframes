import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Organization, OrganizationQuery } from '../../+state';

@Component({
  selector: 'organization-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.scss']
})
export class MemberListComponent implements OnInit {
  public organization$: Observable<Organization>;

  constructor(private query: OrganizationQuery) {}

  ngOnInit() {
    this.organization$ = this.query.select('org');
  }
}
