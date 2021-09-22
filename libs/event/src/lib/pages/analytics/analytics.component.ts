import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { slideUpList } from '@blockframes/utils/animations/fade';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { EventFormShellComponent } from '@blockframes/event/form/shell/shell.component';

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
    private shell: EventFormShellComponent,
  ) { }

  get event() {
    return this.shell.form.value;
  }

  ngOnInit(): void {
    this.dynTitle.setPageTitle('Add an event', 'Event Statistics');
  }

  // Will be used to show event statistics only if event started
  isEventStarted() {
    const start = this.event.start;
    return start.getTime() < Date.now();
  }

}
