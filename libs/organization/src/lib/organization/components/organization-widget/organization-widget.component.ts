import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Organization, OrganizationService } from '../../+state';
import { Observable } from 'rxjs';
import { AuthService } from '@blockframes/auth/+state';
import { User } from '@blockframes/user/+state/user.model';

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
    private authService: AuthService,
  ) { }

  ngOnInit() {
    this.user$ = this.authService.profile$;
    this.organization$ = this.orgService.org$;
  }
}
