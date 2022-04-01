import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Event } from '@blockframes/shared/model';
import { Observable } from 'rxjs';
import { NavTabs, TabConfig } from '@blockframes/utils/event';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { routeAnimation } from '@blockframes/utils/animations/router-animations';
import { EventService } from '@blockframes/event/+state';
import { map, pluck, switchMap } from 'rxjs/operators';

const navTabs: NavTabs = {
  screening: [
    { path: 'invitations', label: 'Invitations' },
    { path: 'statistics', label: 'Statistics' },
  ],
  meeting: [{ path: 'invitations', label: 'Invitations' }],
  slate: [{ path: 'invitations', label: 'Invitations' }],
};

@Component({
  selector: 'event-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss'],
  animations: [routeAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewComponent implements OnInit {
  tabs$: Observable<TabConfig[]>;
  event$: Observable<Event>;

  constructor(private service: EventService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.event$ = this.route.params.pipe(
      pluck('eventId'),
      switchMap((eventId: string) => this.service.valueChanges(eventId))
    );

    this.tabs$ = this.event$.pipe(map(e => navTabs[e.type]));
  }

  animationOutlet(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.animation;
  }
}
