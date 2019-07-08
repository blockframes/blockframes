import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Organization, OrganizationQuery } from '../../+state';

@Component({
  selector: 'org-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.scss']
})
export class MemberListComponent implements OnInit {
  public org$: Observable<Organization>;

  constructor(private query: OrganizationQuery) {}

  ngOnInit() {
    this.org$ = this.query.select('org');
  }
}
