import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AuthStore } from '@blockframes/auth/+state';
@Component({
  selector: 'event-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventRoleComponent {

  constructor(
    private authStore: AuthStore,
  ) { }

  click(role: 'organizer' | 'guest') {
    // Update store with from value
    this.authStore.updateAnonymousCredentials({ role });
  }

}
