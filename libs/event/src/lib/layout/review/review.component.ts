import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Event } from '../../+state/event.model';
import { Observable } from 'rxjs';
import { TabConfig } from '@blockframes/utils/event';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { routeAnimation } from '@blockframes/utils/animations/router-animations';
import { EventService } from '@blockframes/event/+state';
import { pluck, switchMap } from 'rxjs/operators';

const navTabs: TabConfig[] = [
  { path: 'invitations', label: 'Invitations' },
  { path: 'statistics', label: 'Statistics' }
];

@Component({
  selector: 'event-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss'],
  animations: [routeAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewComponent implements OnInit {
  tabs = navTabs;
  event$: Observable<Event>;

  constructor(
    private service: EventService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.event$ = this.route.params.pipe(
      pluck('eventId'),
      switchMap((eventId: string) => this.service.valueChanges(eventId))
    );
  }

  animationOutlet(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.animation;
  }
}
