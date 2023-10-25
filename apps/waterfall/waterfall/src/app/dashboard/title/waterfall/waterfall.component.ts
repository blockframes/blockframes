// Angular
import { Component, ChangeDetectionStrategy } from '@angular/core';

// Blockframes
import { appUrl } from '@env';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';

@Component({
  selector: 'waterfall-title-waterfall',
  templateUrl: './waterfall.component.html',
  styleUrls: ['./waterfall.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallComponent {

  public crmAppUrl = `${appUrl.crm}/c/o/dashboard/crm/waterfall/${this.shell.waterfall.id}`;
  public state$ = this.shell.state$;

  constructor(private shell: DashboardWaterfallShellComponent) { 
    this.shell.setDate(new Date());
  }
}
