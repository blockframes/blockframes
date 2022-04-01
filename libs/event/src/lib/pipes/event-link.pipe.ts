import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { Event } from '@blockframes/shared/model';
import { ModuleGuard } from '@blockframes/utils/routes/module.guard';

@Pipe({ name: 'eventLink', pure: false })
export class EventLinkPipe implements PipeTransform {
  constructor(private moduleGuard: ModuleGuard) { }
  transform(event: Event): string[] {
    const module = this.moduleGuard.currentModule;
    const eventStarted = event.start.getTime() < Date.now();
    const eventEnded = event.end.getTime() < Date.now();
    if (module === 'dashboard') {
      const page = event.type !== 'meeting' ? 'statistics' : 'invitations';
      return eventEnded ? [event.id, page] : [event.id, 'edit'];
    } else if (module === 'marketplace') {
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
