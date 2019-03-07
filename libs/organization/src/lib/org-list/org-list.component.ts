import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { AuthQuery, User } from '@blockframes/auth';
import { Organization, OrganizationQuery, OrganizationService } from '../+state';
import { Observable } from 'rxjs';

@Component({
  selector: 'org-list',
  templateUrl: './org-list.component.html',
  styleUrls: ['./org-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrgListComponent implements OnInit, OnDestroy {
  public user: User;
  public orgList$: Observable<Organization[]>;
  private alive = true;

  constructor(
    private service: OrganizationService,
    private query: OrganizationQuery,
    private auth: AuthQuery
  ) {
  }

  ngOnInit() {
    this.service.subscribeUserOrgs();
    this.user = this.auth.user;
    this.orgList$ = this.query.selectAll();
  }

  ngOnDestroy() {
    this.alive = false;
  }
}
