import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from '@blockframes/auth/+state';
import { AnonymousRole } from '@blockframes/auth/+state/auth.model';
@Component({
  selector: 'event-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventRoleComponent {

  constructor(
    private authService: AuthService,
  ) { }

  click(role: AnonymousRole) {
    // Update store with from value
    this.authService.updateAnonymousCredentials({ role });
  }

}
