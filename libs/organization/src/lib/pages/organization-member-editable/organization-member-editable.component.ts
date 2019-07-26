import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { OrganizationQuery, OrganizationMember } from '../../+state';

@Component({
  selector: 'organization-member-editable',
  templateUrl: './organization-member-editable.component.html',
  styleUrls: ['./organization-member-editable.component.scss']
})
export class OrganizationMemberEditableComponent implements OnInit {
  public opened = false;
  public members$: Observable<OrganizationMember[]>;
  public member: OrganizationMember;

  constructor(private query: OrganizationQuery) {}

  ngOnInit() {
    this.members$ = this.query.select(state => state.org.members);
  }

  public openSidenav(member: OrganizationMember) {
    this.member = member;
    this.opened = true;
  }
}
