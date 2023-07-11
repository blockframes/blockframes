// Angular
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

import { MatSnackBar } from '@angular/material/snack-bar';

// Blockframes
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';
import { WaterfallPermissionsService } from '@blockframes/waterfall/permissions.service';
import {
  TitleState,
  History,
  Waterfall,
  buildActions
} from '@blockframes/model';
import { BlockService } from '@blockframes/waterfall/block.service';
import { WaterfallDocumentsService } from '@blockframes/waterfall/documents.service';
import { IncomeService } from '@blockframes/contract/income/service';
import { where } from 'firebase/firestore';
import { TermService } from '@blockframes/contract/term/service';
import { ExpenseService } from '@blockframes/contract/expense/service';

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
    private waterfallDocumentsService: WaterfallDocumentsService,
    private incomeService: IncomeService,
    private termService: TermService,
    private expenseService: ExpenseService,
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

    const [contracts, incomes, expenses] = await Promise.all([
      this.waterfallDocumentsService.getContracts(this.waterfall.id),
      this.incomeService.getValue([where('titleId', '==', this.waterfall.id)]),
      this.expenseService.getValue([where('titleId', '==', this.waterfall.id)])
    ]);

    const terms = (await Promise.all(contracts.map(c => this.termService.getValue([where('contractId', '==', c.id)])))).flat();

    const actions = buildActions(contracts, incomes, expenses, terms, this.waterfall.sources);

    const [init] = await Promise.all([
      this.blockService.create(this.waterfall.id, 'init', actions),
      this.waterfallService.addVersion(this.waterfall, { id: 'version_1', description: 'First Version' })
    ]);

    this.waterfall = await this.waterfallService.addBlocksToVersion(this.waterfall, 'version_1', [init]);

    await this.loadWaterfall();
  }
}
