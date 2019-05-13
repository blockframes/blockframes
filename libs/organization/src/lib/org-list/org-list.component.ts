import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { AuthQuery, User } from '@blockframes/auth';
import { Organization, OrganizationQuery, OrganizationService } from '../+state';
import { Observable } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'org-list',
  templateUrl: './org-list.component.html',
  styleUrls: ['./org-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrgListComponent implements OnInit, OnDestroy {
  public orgList$: Observable<Organization[]>;
  private isAlive = true;

  constructor(
    private service: OrganizationService,
    private query: OrganizationQuery,
    private auth: AuthQuery
  ) {
  }

  ngOnInit() {

    this.auth.user$.pipe(takeWhile(() => !!this.isAlive)).subscribe((user: User) => {
      this.service.subscribeUserOrgs(user.uid);
    });

    this.orgList$ = this.query.selectAll();
  }

  ngOnDestroy() {
    this.isAlive = false;
  }
}
