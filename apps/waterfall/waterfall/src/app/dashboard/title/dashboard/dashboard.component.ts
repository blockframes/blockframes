// Angular
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

// Blockframes
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';
import { WaterfallService, WaterfallState } from '@blockframes/waterfall/waterfall.service';


@Component({
  selector: 'waterfall-title-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {

  constructor(
    private waterfallService: WaterfallService,
    private shell: DashboardWaterfallShellComponent,
    private snackBar: MatSnackBar,
  ) { }

  // TODO #9519
  async ngOnInit() {
   /* const { id : waterfallId} = await this.shell.movie;

    const data = await this.waterfallService.loadWaterfalldata(waterfallId);
    const versionId = data.waterfall.versions[0].id;

    this.snackBar.open('Waterfall is loading. Please wait', 'close', { duration: 5000 });
    this.state = await this.waterfallService.buildWaterfall({ waterfallId, versionId });
    this.snackBar.open('Waterfall loaded !', 'close', { duration: 5000 });

    console.log(this.state)*/

  }
}
