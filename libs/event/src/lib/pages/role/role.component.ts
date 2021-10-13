import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { EventQuery, EventStore } from '@blockframes/event/+state';

@Component({
  selector: 'event-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventRoleComponent {

  constructor(
    private eventStore: EventStore,
    private eventQuery: EventQuery,
    private router: Router
  ) { }

  click(role:'organizer' | 'guest') {
    // Update store with from value
    this.eventStore.update(() => ({ role }));
    // Redirect user to identity page
    this.router.navigate([`events/${this.eventQuery.getActiveId()}/r/identity`]);
  }

}
