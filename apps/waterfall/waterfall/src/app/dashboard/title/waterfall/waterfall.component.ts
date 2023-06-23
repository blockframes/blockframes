// Angular
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

import { MatSnackBar } from '@angular/material/snack-bar';

// Blockframes
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';
import { WaterfallPermissionsService } from '@blockframes/waterfall/permissions.service';
import { TitleState, History, Waterfall, createIncome, action, Action } from '@blockframes/model';
import { BlockService } from '@blockframes/waterfall/block.service';
import { WaterfallDocumentsService } from '@blockframes/waterfall/documents.service';
import { TermService } from '@blockframes/contract/term/service';
import { IncomeService } from '@blockframes/contract/income/service';

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

    // TEMP
    private waterfallDocumentsService: WaterfallDocumentsService,
    private termService: TermService,
    private incomeService: IncomeService
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

  /**
   * TODO TMP
   */
  private async populateIncomes() {

    const madman_au = await this.waterfallDocumentsService.getContract('madman_au', this.waterfall.id);
    const madman_au_term = await this.termService.getValue(madman_au.termIds[0]);

    const madman_1 = createIncome({
      id: 'madman_1',
      contractId: madman_au.id,
      termId: madman_au_term.id,
      price: 26077.45,
      currency: 'EUR',
      status: 'processed',
      titleId: this.waterfall.id,
      date: new Date('2017/02/28')
    });
    await this.incomeService.add(madman_1);

    const telepool_ger = await this.waterfallDocumentsService.getContract('telepool_ger', this.waterfall.id);
    const telepool_ger_term = await this.termService.getValue(telepool_ger.termIds[0]);

    const telepool_1 = createIncome({
      id: 'telepool_1',
      contractId: telepool_ger.id,
      termId: telepool_ger_term.id,
      price: 50000,
      currency: 'EUR',
      status: 'processed',
      titleId: this.waterfall.id,
      date: new Date('2017/10/31'),
    });
    await this.incomeService.add(telepool_1);

    const netflix_us = await this.waterfallDocumentsService.getContract('netflix_us', this.waterfall.id);
    const netflix_us_term = await this.termService.getValue(netflix_us.termIds[0]);

    const netflix_us_1 = createIncome({
      id: 'netflix_us_1',
      contractId: netflix_us.id,
      termId: netflix_us_term.id,
      price: 11509.18,
      currency: 'EUR',
      status: 'processed',
      titleId: this.waterfall.id,
      date: new Date('2017/02/28')
    });
    await this.incomeService.add(netflix_us_1);

    const netflix_us_2 = createIncome({
      id: 'netflix_us_2',
      contractId: netflix_us.id,
      termId: netflix_us_term.id,
      price: 12892.65,
      currency: 'EUR',
      status: 'processed',
      titleId: this.waterfall.id,
      date: new Date('2017/04/30')
    });
    await this.incomeService.add(netflix_us_2);

    const actions: Action[] = [
      action('append', { id: 'test', orgId: 'test', previous: [], percent: 1 }),

      action('income', { id: madman_1.id, from: madman_au.id, to: 'test', amount: madman_1.price, date: madman_1.date, territory: madman_au_term.territories, media: madman_au_term.medias }),
      action('income', { id: telepool_1.id, from: telepool_ger.id, to: 'test', amount: telepool_1.price, date: telepool_1.date, territory: telepool_ger_term.territories, media: telepool_ger_term.medias }),

      action('income', { id: netflix_us_1.id, from: netflix_us.id, to: 'test', amount: netflix_us_1.price, date: netflix_us_1.date, territory: netflix_us_term.territories, media: netflix_us_term.medias }),
      action('income', { id: netflix_us_2.id, from: netflix_us.id, to: 'test', amount: netflix_us_2.price, date: netflix_us_2.date, territory: netflix_us_term.territories, media: netflix_us_term.medias }),
    ];

    return actions;
  }

  async initWaterfall() {
    const actions = await this.populateIncomes();

    this.isLoading$.next(true);

    const isProducer = await this.waterfallPermissionsService.hasRole(this.waterfall.id, 'producer');

    if (!isProducer) {
      this.snackbar.open('Only user with producer role can initialize waterfall', 'close', { duration: 5000 });
      this.isLoading$.next(false);
      return;
    }

    const [init] = await Promise.all([
      this.blockService.create(this.waterfall.id, 'init', actions),
      this.waterfallService.addVersion(this.waterfall, { id: 'version_1', description: 'First Version' })
    ]);

    this.waterfall = await this.waterfallService.addBlocksToVersion(this.waterfall, 'version_1', [init]);

    await this.loadWaterfall();
  }
}
