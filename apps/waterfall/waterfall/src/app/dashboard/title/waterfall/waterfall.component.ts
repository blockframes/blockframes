// Angular
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

// Blockframes
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';
import { TitleState, History, Waterfall } from '@blockframes/model';
import { appUrl } from '@env';

@Component({
  selector: 'waterfall-title-waterfall',
  templateUrl: './waterfall.component.html',
  styleUrls: ['./waterfall.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallComponent implements OnInit {

  public crmAppUrl;
  public isLoading$ = new BehaviorSubject(true);
  public tree: { state: TitleState; history: History[] };

  private waterfall: Waterfall;

  constructor(
    private route: ActivatedRoute,
    private waterfallService: WaterfallService
  ) { }

  async ngOnInit() {
    const waterfallId: string = this.route.snapshot.params.movieId;
    this.crmAppUrl = `${appUrl.crm}/c/o/dashboard/crm/waterfall/${waterfallId}`;
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
}
