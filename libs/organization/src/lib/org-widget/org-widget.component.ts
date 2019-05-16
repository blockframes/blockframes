import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AuthQuery, User } from '@blockframes/auth';
import { Organization, OrganizationQuery } from '../+state';
import { Observable } from 'rxjs';

@Component({
  selector: 'org-widget',
  templateUrl: './org-widget.component.html',
  styleUrls: ['./org-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrgWidgetComponent implements OnInit {
  public orgList$: Observable<Organization[]>;
  public user$: Observable<User>;

  constructor(
    private query: OrganizationQuery,
    private auth: AuthQuery,
  ) {
  }

  ngOnInit() {
    this.user$ = this.auth.user$;
    this.orgList$ = this.query.selectAll();
  }
}
