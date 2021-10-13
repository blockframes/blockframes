import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { EventQuery, EventStore } from '@blockframes/event/+state';

@Component({
  selector: 'event-identity',
  templateUrl: './identity.component.html',
  styleUrls: ['./identity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventIdenityComponent {

  constructor(
    private eventStore: EventStore,
    private eventQuery: EventQuery,
    private router: Router
  ) { }

  click() {
    // Update store with from value
    this.eventStore.update(() => ({ lastName: 'bruce', firstName: 'test' }));
    // Redirect user to event view
    this.router.navigate([`events/${this.eventQuery.getActiveId()}/r/i`]);
  }

}
