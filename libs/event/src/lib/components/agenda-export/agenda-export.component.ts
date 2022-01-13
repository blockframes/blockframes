import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Event } from '@blockframes/event/+state/event.model';
import { AgendaService } from '@blockframes/utils/agenda/agenda.service';

@Component({
  selector: 'event-agenda-export',
  templateUrl: './agenda-export.component.html',
  styleUrls: ['./agenda-export.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgendaExportComponent {
  @Input() event: Event;
  @Input() text: string;

  constructor(private agendaService: AgendaService) { }

  exportToCalendar(event: Event) {
    this.agendaService.download([event]);
  }

}
