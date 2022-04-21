import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthService } from '@blockframes/auth/+state/auth.service';
import { OrganizationService } from '@blockframes/organization/+state';

@Component({
  selector: 'auth-sidenav',
  templateUrl: './sidenav-auth.component.html',
  styleUrls: ['./sidenav-auth.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidenavAuthComponent {
  org$ = this.orgService.currentOrg$;

  constructor(
    private authService: AuthService,
    private orgService: OrganizationService
  ) { }

  public async logout() {
    await this.authService.signOut();
  }

}