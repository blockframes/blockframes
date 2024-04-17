// Angular
import { Component, ChangeDetectionStrategy } from '@angular/core';

// Blockframes
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';
import { AmortizationService } from '@blockframes/waterfall/amortization.service';
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
    public service: AmortizationService
  ) {
    this.dynTitle.setPageTitle(this.shell.movie.title.international, 'Film Amortization');
  }

}
