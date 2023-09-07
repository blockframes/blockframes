import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import {
  Block,
  History,
  IncomeState,
  Movie,
  PricePerCurrency,
  Version,
  Waterfall,
  mainCurrency
} from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
import { BlockService } from '@blockframes/waterfall/block.service';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';

@Component({
  selector: 'crm-waterfall-dashboard',
  templateUrl: './waterfall-dashboard.component.html',
  styleUrls: ['./waterfall-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallDashboardComponent implements OnInit {
  public movie: Movie;
  public waterfall: Waterfall;
  public version: Version;
  public blocks: Block[];
  public history: History[];

  public currentState: History;

  constructor(
    private movieService: MovieService,
    private waterfallService: WaterfallService,
    private blockService: BlockService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) { }

  async ngOnInit() {
    const waterfallId = this.route.snapshot.paramMap.get('waterfallId');
    const versionId = this.route.snapshot.paramMap.get('versionId');
    const [movie, waterfall] = await Promise.all([
      this.movieService.getValue(waterfallId),
      this.waterfallService.getValue(waterfallId),
    ]);
    this.movie = movie;
    this.waterfall = waterfall;

    this.snackBar.open('Waterfall is loading. Please wait', 'close', { duration: 5000 });
    const data = await this.waterfallService.buildWaterfall({ waterfallId, versionId });
    console.log(data); // TODO #9493 remove
    this.history = data.waterfall.history;
    this.version = data.version;
    this.blocks = await this.blockService.getValue(this.version.blockIds, { waterfallId });

    this.cdRef.markForCheck();
    this.snackBar.open('Waterfall loaded !', 'close', { duration: 5000 });

    this.cdRef.markForCheck();
  }

  public selectBlock(blockId: string) {
    const index = this.version.blockIds.indexOf(blockId);
    this.currentState = this.history[index + 1]; // First history entry is always empty (init)

    this.cdRef.markForCheck();
  }

  public getTotalIncomes(incomeState: Record<string, IncomeState>): PricePerCurrency {
    const incomeStates = Object.values(incomeState);
    if (!incomeStates.length) return this.getPrice(0);
    return this.getPrice(incomeStates.map(a => a.amount).reduce((a, b) => a + b));
  }

  public getPrice(amount: number): PricePerCurrency {
    return { [mainCurrency]: amount };
  }

  public getRightholderName(id: string) {
    if (!id) return '--';
    return this.waterfall.rightholders.find(r => r.id === id)?.name || '--';
  }
}