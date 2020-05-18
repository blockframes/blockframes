import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventService, Event } from '@blockframes/event/+state';
import { pluck, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';


@Component({
  selector: 'festival-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SessionComponent implements OnInit {

  public background: string;
  event$: Observable<Event>;
  public showSession = true;

  constructor(
    private service: EventService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.event$ = this.route.params.pipe(
      pluck('eventId'),
      switchMap(eventId => this.service.queryDocs(eventId))
    );
    this.background = `url(https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260)`;
  }

  playVideo() {
    this.showSession = false;
    return;
  }
}
