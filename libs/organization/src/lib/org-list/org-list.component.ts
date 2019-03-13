import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { AuthQuery, User } from '@blockframes/auth';
import { Organization, OrganizationQuery, OrganizationService } from '../+state';
import { Observable } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';

@Component({
  selector: 'org-list',
  templateUrl: './org-list.component.html',
  styleUrls: ['./org-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrgListComponent implements OnInit, OnDestroy {
  public orgList$: Observable<Organization[]>;
  private alive = true;

  constructor(
    private service: OrganizationService,
    private query: OrganizationQuery,
    private auth: AuthQuery
  ) {
  }

  ngOnInit() {
    
    this.auth.user$().subscribe((user: User) => {
      // @todo remove observable on ngDestroy
      this.service.subscribeUserOrgs(user.uid);
    });

    this.orgList$ = this.query.selectAll();
  }

  ngOnDestroy() {
    this.alive = false;
  }
}
