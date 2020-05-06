import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { EventService } from '@blockframes/event/+state/event.service';
import { Event } from '@blockframes/event/+state';
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ViewComponent } from '../view/view.component';

@Component({
  selector: 'festival-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MeetingComponent implements OnInit {
  events$: Observable<Event[]>;
  viewDate = new Date();

  constructor(
    private parent: ViewComponent,
    private service: EventService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.events$ = this.parent.org$.pipe(
      switchMap(org => this.service.queryByType(['meeting'], ref => ref.where('ownerId', '==', org.id)))
    )
  }


  updateViewDate(date: Date) {
    this.viewDate = date;
    this.cdr.markForCheck();
  }

}
