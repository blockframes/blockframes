import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from '@blockframes/auth/+state';
import { EventQuery } from '@blockframes/event/+state';

@Component({
  selector: 'event-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventRoleComponent {

  constructor(
    private authStore: AuthStore,
    private eventQuery: EventQuery,
    private router: Router
  ) { }

  click(role: 'organizer' | 'guest') {
    // Update store with from value
    this.authStore.update(() => ({ anonymousAuth: { role } }));
    // Redirect user to identity page
    this.router.navigate([`events/${this.eventQuery.getActiveId()}/r/identity`]);
  }

}
