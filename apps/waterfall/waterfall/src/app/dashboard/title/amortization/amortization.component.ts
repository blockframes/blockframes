// Angular
import { Component, ChangeDetectionStrategy } from '@angular/core';

// Blockframes
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'waterfall-title-amortization',
  templateUrl: './amortization.component.html',
  styleUrls: ['./amortization.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AmortizationComponent {
 
  constructor(
    private shell: DashboardWaterfallShellComponent,
    private dynTitle: DynamicTitleService,
  ) {
    this.dynTitle.setPageTitle(this.shell.movie.title.international, 'Film Amortization');
  }

}
