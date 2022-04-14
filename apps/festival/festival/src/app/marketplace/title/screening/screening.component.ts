import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { EventService } from '@blockframes/event/+state/event.service';
import { TitleMarketplaceShellComponent } from '@blockframes/movie/marketplace/shell/shell.component';
import { Event } from '@blockframes/model';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
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
    private parent: TitleMarketplaceShellComponent,
    private service: EventService,
    private dynTitle: DynamicTitleService,
    private agendaService: AgendaService,
  ) { }

  ngOnInit(): void {
    this.dynTitle.setPageTitle('Film Page', 'Screening Schedule');
    this.events$ = this.parent.movie$.pipe(
      switchMap(movie => {
        const query = [
          where('isSecret', '==', false),
          where('meta.titleId', '==', movie.id),
          orderBy('end'),
          startAt(new Date())
        ];
        return this.service.queryByType(['screening'], query);
      }),
    );
  }

  exportToCalendar(events: Event[] = []) {
    this.agendaService.download(events);
  }

}
