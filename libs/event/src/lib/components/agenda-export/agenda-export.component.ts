import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Event } from '@blockframes/event/+state/event.model';
import { IcsService } from '@blockframes/utils/ics/ics.service';

@Component({
  selector: 'event-agenda-export',
  templateUrl: './agenda-export.component.html',
  styleUrls: ['./agenda-export.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgendaExportComponent {
  @Input() event: Event;
  @Input() text: string;

  constructor(private icsService: IcsService) { }

  exportToCalendar(event: Event) {
    this.icsService.download([event]);
  }

}
