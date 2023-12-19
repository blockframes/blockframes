// Angular
import { Component, ChangeDetectionStrategy } from '@angular/core';

// Blockframes
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';

@Component({
  selector: 'waterfall-title-waterfall',
  templateUrl: './waterfall.component.html',
  styleUrls: ['./waterfall.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallComponent {
  public waterfall$ = this.shell.waterfall$;
  public rights$ = this.shell.rights$;

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private dynTitle: DynamicTitleService,
  ) {
    this.shell.setDate(undefined);
    this.dynTitle.setPageTitle(this.shell.movie.title.international, 'Waterfall');
  }
}
