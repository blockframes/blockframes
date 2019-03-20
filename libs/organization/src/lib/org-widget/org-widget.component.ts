import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { AuthQuery, User } from '@blockframes/auth';
import { Organization, OrganizationQuery, OrganizationService } from '../+state';
import { Observable } from 'rxjs';

@Component({
  selector: 'org-widget',
  templateUrl: './org-widget.component.html',
  styleUrls: ['./org-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrgWidgetComponent implements OnInit, OnDestroy {
  public orgList$: Observable<Organization[]>;
  public user$: Observable<User>;

  constructor(
    private service: OrganizationService,
    private query: OrganizationQuery,
    private auth: AuthQuery
  ) {
  }

  ngOnInit() {
    this.user$ = this.auth.user$();

    this.user$.subscribe((user: User) => {
      // @todo remove observable on ngDestroy
      if(user !== null) {
        this.service.subscribeUserOrgs(user.uid);
      }
    });

    this.orgList$ = this.query.selectAll();
  }

  ngOnDestroy() {
  }
}
