import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Organization, OrganizationQuery } from '../+state';
import { Observable } from 'rxjs';

@Component({
  selector: 'org-list',
  templateUrl: './org-list.component.html',
  styleUrls: ['./org-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrgListComponent implements OnInit {
  public orgList$: Observable<Organization[]>;

  constructor(
    private query: OrganizationQuery,
  ) {}

  ngOnInit() {
    this.orgList$ = this.query.selectAll();
  }

}
