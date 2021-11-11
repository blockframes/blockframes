import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { getCurrentModule } from '@blockframes/utils/apps';
import { Event } from '../+state/event.model';
import { RouterQuery } from '@datorama/akita-ng-router-store';

@Pipe({ name: 'eventLink', pure: false })
export class EventLinkPipe implements PipeTransform {
  constructor(private routeQuery: RouterQuery) { }
  transform(event: Event): string[] {
    const { url } = this.routeQuery.getValue().state;
    const module = getCurrentModule(url);
    const eventStarted = event.start.getTime() < Date.now();
    const eventEnded = event.end.getTime() < Date.now();
    if (module === 'dashboard') {
      const page = event.type !== 'meeting' ? 'statistics' : 'invitations';
      return eventEnded ? [event.id, page] : [event.id, 'edit'];
    }
    if (module === 'marketplace') {
      const inSession = eventStarted && !eventEnded;
      const page = event.type === 'meeting' ? 'lobby' : 'session';
      return inSession ? ['/event', event.id, 'r', 'i', page] : ['/event', event.id, 'r', 'i'];
    }
  }
}

@NgModule({
  declarations: [EventLinkPipe],
  exports: [EventLinkPipe],
})
export class EventLinkModule { }
