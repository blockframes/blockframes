import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { EventService } from '@blockframes/event/+state/event.service';
import { ViewComponent } from '../view/view.component';
import { Event } from '@blockframes/event/+state';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { Screening } from '@blockframes/event/+state/event.firestore';
import { AgendaService } from '@blockframes/utils/agenda/agenda.service';
import { orderBy, startAt, where } from 'firebase/firestore';

@Component({
  selector: 'festival-screening',
  templateUrl: './screening.component.html',
  styleUrls: ['./screening.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScreeningComponent implements OnInit {
  events$: Observable<Event[]>;

  constructor(
    private parent: ViewComponent,
    private service: EventService,
    private dynTitle: DynamicTitleService,
    private agendaService: AgendaService,
  ) { }

  ngOnInit(): void {
    this.dynTitle.setPageTitle('Sales Agent', 'Screenings');
    this.events$ = this.parent.org$.pipe(
      switchMap(org => {
        const query = [
          where('ownerOrgId', '==', org.id),
          where('isSecret', '==', false),
          orderBy('end'),
          startAt(new Date())
        ];
        return this.service.queryByType(['screening'], query).pipe(
          // We can't filter by meta.titleId directly in the query because
          // firestore supports only one orderBy if it uses where()
          map((events: Event<Screening>[]) => events.filter(event => !!event.meta.titleId))
        );
      }),
    );
  }

  exportToCalendar(events: Event[] = []) {
    this.agendaService.download(events);
  }

}
