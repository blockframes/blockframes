import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AuthQuery, User } from '@blockframes/auth';
import { Organization, OrganizationQuery } from '../../+state';
import { Observable } from 'rxjs';

@Component({
  selector: 'organization-widget',
  templateUrl: './organization-widget.component.html',
  styleUrls: ['./organization-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationWidgetComponent implements OnInit {
  public organization$: Observable<Organization>;
  public user$: Observable<User>;

  constructor(
    private query: OrganizationQuery,
    private auth: AuthQuery,
  ) {
  }

  ngOnInit() {
    this.user$ = this.auth.user$;
    this.organization$ = this.query.select('org');
  }
}
