import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthService } from '@blockframes/auth/+state';

@Component({
  selector: 'org-request-access-pending',
  templateUrl: './request-access-pending.component.html',
  styleUrls: ['./request-access-pending.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrgRequestAccessPendingComponent {

  constructor(
    private authService: AuthService,
  ) { }

  refresh() {
    window.location.reload();
  }

  logout() {
    this.authService.signOut();
  }
}
