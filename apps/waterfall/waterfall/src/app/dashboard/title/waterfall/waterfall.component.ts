// Angular
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';

// Blockframes
import { appUrl } from '@env';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';

@Component({
  selector: 'waterfall-title-waterfall',
  templateUrl: './waterfall.component.html',
  styleUrls: ['./waterfall.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallComponent implements OnInit {

  public crmAppUrl;
  public state$ = this.shell.state$;

  constructor(
    private shell: DashboardWaterfallShellComponent,
  ) { }

  async ngOnInit() {
    const { id: waterfallId } = await this.shell.movie;
    this.crmAppUrl = `${appUrl.crm}/c/o/dashboard/crm/waterfall/${waterfallId}`;
  }


}
