import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { slideUpList } from '@blockframes/utils/animations/fade';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { EventEditComponent } from '@blockframes/event/layout/edit/edit.component';

@Component({
  selector: 'event-analytics-page',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss'],
  animations: [slideUpList('h2, mat-card')],// @TODO #5895 check Antoine
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalyticsComponent implements OnInit {

  constructor(
    private dynTitle: DynamicTitleService,
    private shell: EventEditComponent,
  ) { }

  get event() {
    return this.shell.form.value;
  }

  ngOnInit(): void {
    this.dynTitle.setPageTitle('Add an event', 'Event Attendance');
  }

  // Will be used to show event statistics only if event started
  isEventStarted() {
    const start = this.event.start;
    return start.getTime() < Date.now();
  }

}
