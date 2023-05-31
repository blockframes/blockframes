// Angular
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';

// Blockframes
import { actions } from '@blockframes/waterfall/fixtures/terrawilly-demo';
import { ActivatedRoute } from '@angular/router';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';
import { WaterfallPermissionsService } from '@blockframes/waterfall/permissions.service';
import { TitleState, History, Waterfall } from '@blockframes/model';
import { BehaviorSubject } from 'rxjs';
import { BlockService } from '@blockframes/waterfall/block.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'waterfall-title-waterfall',
  templateUrl: './waterfall.component.html',
  styleUrls: ['./waterfall.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallComponent implements OnInit {

  public isLoading$ = new BehaviorSubject(true);
  public tree: { state: TitleState; history: History[] };

  private waterfall: Waterfall;

  constructor(
    private route: ActivatedRoute,
    private waterfallService: WaterfallService,
    private waterfallPermissionsService: WaterfallPermissionsService,
    private blockService: BlockService,
    private snackbar: MatSnackBar,
  ) { }

  async ngOnInit() {
    const waterfallId: string = this.route.snapshot.params.movieId;
    this.waterfall = await this.waterfallService.getValue(waterfallId);
    await this.loadWaterfall();
  }

  async loadWaterfall() {
    if (this.waterfall.versions.length) {
      const firstVersion = this.waterfall.versions.shift();
      const data = await this.waterfallService.buildWaterfall({ waterfallId: this.waterfall.id, versionId: firstVersion.id });
      this.tree = data.waterfall;
    }
    this.isLoading$.next(false);
  }

  async initWaterfall() {
    this.isLoading$.next(true);

    const isProducer = await this.waterfallPermissionsService.hasRole(this.waterfall.id, 'producer');

    if (!isProducer) {
      this.snackbar.open('Only user with producer role can initialize waterfall', 'close', { duration: 5000 });
      this.isLoading$.next(false);
      return;
    }

    // TODO temp: initialize waterfall with json fixtures
    const [init] = await Promise.all([
      this.blockService.create(this.waterfall.id, 'init', actions),
      this.waterfallService.addVersion(this.waterfall, { id: 'version_1', description: 'First Version' })
    ]);

    this.waterfall = await this.waterfallService.addBlocksToVersion(this.waterfall, 'version_1', [init]);

    await this.loadWaterfall();
  }
}
