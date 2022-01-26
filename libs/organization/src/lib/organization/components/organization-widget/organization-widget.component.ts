import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { Organization, OrganizationService } from '../../+state';
import { Observable } from 'rxjs';
import { User } from '@blockframes/auth/+state/auth.store';

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
    private orgService: OrganizationService,
    private auth: AuthQuery,
  ) { }

  ngOnInit() {
    this.user$ = this.auth.user$;
    this.organization$ = this.orgService.org$;
  }
}
