import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { Event } from '../+state/event.model';
import { IcsService } from '@blockframes/utils/ics/ics.service';

@Pipe({ name: 'googleAgendaLink', pure: false })
export class ExportToGoogleAgendaPipe implements PipeTransform {
  constructor(private icsService: IcsService) { }
  transform(event: Event) {
    return this.icsService.link(event);
  }
}

@NgModule({
  declarations: [ExportToGoogleAgendaPipe],
  exports: [ExportToGoogleAgendaPipe],
})
export class ExportToGoogleAgendaModule { }
