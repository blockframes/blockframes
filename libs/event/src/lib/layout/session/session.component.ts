import { Component, ChangeDetectionStrategy, OnInit, HostBinding } from '@angular/core';
import { EventQuery, Event } from '@blockframes/event/+state';
import { Observable } from 'rxjs';
import { MovieQuery, Movie } from '@blockframes/movie/+state';
import { OrganizationQuery, Organization } from '@blockframes/organization/+state';

@Component({
  selector: 'event-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventSessionComponent implements OnInit {

  @HostBinding('style.background-image') background: string;
  event$: Observable<Event>;
  public time: string;
  public movie;
  public org;

  constructor(
    private query: EventQuery,
    private movieQuery: MovieQuery,
    private orgQuery: OrganizationQuery
  ) {}

  ngOnInit() {
    this.event$ = this.query.selectActive();
    this.eventTime();
    this.movie = this.event$.subscribe(event => this.movieQuery.getEntity(event.meta.titleId));
    this.background = `url(${this.movie.promotionalElements.banner.media.url})`;
    this.org = this.event$.subscribe(event =>  this.orgQuery.getEntity(event.ownerId));
  }

  eventTime() {
    this.event$.subscribe(event => {
      const startInMs = Date.parse(event.start.toString());
      const endInMs = Date.parse(event.end.toString());
      const now = Date.now();

      if (now < startInMs) {
        this.time = 'early';
      } else if (startInMs <= now && now < endInMs) {
        this.time = 'onTime';
      } else if (now > endInMs) {
        this.time = 'late';
      }

      return this.time;
    });
  }

  timeBeforeNextScreening(date) {
    const milliseconds = Date.parse(date) - Date.now();
    const msInDays = 1000 * 60 * 60 * 24;
    const msInHours = 1000 * 60 * 60;
    const msInMins = 1000 * 60;

    const days = Math.trunc(milliseconds / msInDays);
    const hours = Math.trunc((milliseconds - (days*msInDays)) / msInHours);
    const mins = Math.trunc((milliseconds - (hours*msInHours) - (days*msInDays)) / msInMins);

    return `${days} days | ${hours} hours | ${mins} minutes`;
  }
}
