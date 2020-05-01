import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { EventService } from '@blockframes/event/+state/event.service';
import { ViewComponent } from '../view/view.component';
import { Event } from '@blockframes/event/+state';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'festival-marketplace-organization-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventComponent implements OnInit {
  events$: Observable<Event[]>;
  viewDate = new Date();

  constructor(
    private service: EventService,
    private parent: ViewComponent
  ) { }

  ngOnInit(): void {
    this.events$ = this.parent.org$.pipe(
      switchMap(org => this.service.queryByType(['screening'], ref => ref.where('ownerId', '==', org.id)))
    );
  }
}
