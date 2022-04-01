import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { Event } from '@blockframes/shared/model';
import { AgendaService } from '@blockframes/utils/agenda/agenda.service';

@Pipe({ name: 'googleAgendaLink', pure: false })
export class ExportToGoogleAgendaPipe implements PipeTransform {
  constructor(private agendaService: AgendaService) {}
  transform(event: Event) {
    return this.agendaService.link(event);
  }
}

@NgModule({
  declarations: [ExportToGoogleAgendaPipe],
  exports: [ExportToGoogleAgendaPipe],
})
export class ExportToGoogleAgendaModule {}
