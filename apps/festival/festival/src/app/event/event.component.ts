import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map, pluck, switchMap } from 'rxjs/operators';
import { EventService } from '@blockframes/event/+state';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'festival-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventComponent implements OnInit {

  isMeeting$: Observable<boolean>;

  constructor(
    private route: ActivatedRoute,
    private service: EventService,
  ) { }

  ngOnInit() {
    this.isMeeting$ = this.route.params.pipe(
      pluck('eventId'),
      switchMap((eventId: string) => this.service.queryDocs(eventId)),
      map(event => event?.type === 'meeting'),
    );
  }
}
