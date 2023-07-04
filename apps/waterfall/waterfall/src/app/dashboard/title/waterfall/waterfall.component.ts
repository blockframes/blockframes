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
  action,
  Action,
  getDeclaredAmount,
  getCurrentContract,
  getContractAndAmendments,
  WaterfallSource,
  createWaterfallSource,
  territories,
  Territory,
  getAssociatedSource
} from '@blockframes/model';
import { BlockService } from '@blockframes/waterfall/block.service';
import { WaterfallDocumentsService } from '@blockframes/waterfall/documents.service';
import { IncomeService } from '@blockframes/contract/income/service';
import { where } from 'firebase/firestore';
import { TermService } from '@blockframes/contract/term/service';
import { ExpenseService } from '@blockframes/contract/expense/service';

// TODO #9420 temp casablancas sources
const allTerritories = Object.keys(territories).filter((t: Territory) => t !== 'world') as Territory[];

const sources: WaterfallSource[] = [
  createWaterfallSource('fr_cine', ['france'], [], ['theatrical']),
  createWaterfallSource('fr_dvd', ['france'], [], ['rental', 'through']),
  createWaterfallSource('fr_vod', ['france'], [], ['est', 'nVod', 'aVod', 'fVod', 'sVod', 'tVod']),
  createWaterfallSource('fr_tv', ['france'], [], ['payTv', 'freeTv', 'payPerView']),
  createWaterfallSource('fr_svod', ['france'], [], ['sVod']),
  createWaterfallSource('us_svod', ['united-states-of-america', 'canada'], [], ['sVod']),
  createWaterfallSource('row_svod', allTerritories, ['united-states-of-america', 'canada', 'france'], ['sVod']),
  createWaterfallSource('festivals', allTerritories, [], ['festival']),
  createWaterfallSource('us_all', ['united-states-of-america', 'canada'], [], ['theatrical', 'rental', 'through']),
  createWaterfallSource('row_all', allTerritories, ['united-states-of-america', 'canada', 'france'], ['theatrical', 'rental', 'through', 'payTv', 'freeTv', 'payPerView', 'est', 'nVod', 'aVod', 'fVod', 'sVod', 'tVod']),
];

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
    await this.waterfallService.addSources(waterfallId, sources);
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

  private async getActions() {

    const [contracts, incomes, expenses] = await Promise.all([
      this.waterfallDocumentsService.getContracts(this.waterfall.id),
      this.incomeService.getValue([where('titleId', '==', this.waterfall.id)]),
      this.expenseService.getValue([where('titleId', '==', this.waterfall.id)])
    ]);

    const terms = (await Promise.all(contracts.map(c => this.termService.getValue([where('contractId', '==', c.id)])))).flat();

    const actions: Action[] = [
      action('append', { id: 'test', orgId: 'test', previous: [], percent: 1 })
    ];

    contracts.forEach(c => {
      if (c.rootId) {
        actions.push(
          action('updateContract', {
            amount: getDeclaredAmount({ ...c, terms: terms.filter(t => t.contractId === c.id) }).EUR, // TODO #9420 should converted to a single currency
            id: c.rootId,
            date: c.signatureDate,
            start: c.duration.from,
            end: c.duration.to
          })
        );
      } else {
        actions.push(
          action('contract', {
            amount: getDeclaredAmount({ ...c, terms: terms.filter(t => t.contractId === c.id) }).EUR, // TODO #9420 should converted to a single currency
            id: c.id,
            date: c.signatureDate,
            start: c.duration.from,
            end: c.duration.to
          })
        );
      }
    });

    incomes.forEach(i => {
      const contractAndAmendments = getContractAndAmendments(i.contractId, contracts);
      const contract = getCurrentContract(contractAndAmendments, i.date);
      const source = getAssociatedSource(i, this.waterfall.sources);
      if (!source) {
        this.snackbar.open(`Could not find source for income ${i.id}`, 'close', { duration: 5000 });
        return;
      }
      actions.push(
        action('income', {
          id: i.id,
          contractId: contract.id,
          from: source.name,
          to: 'test',
          amount: i.price,
          date: i.date,
          territory: i.territories,
          media: i.medias
        })
      );
    });

    expenses.forEach(e => {
      const contractAndAmendments = getContractAndAmendments(e.contractId, contracts);
      const contract = getCurrentContract(contractAndAmendments, e.date);
      actions.push(
        action('expense', {
          orgId: contract.buyerId,
          amount: e.price,
          type: e.type,
          date: e.date
        })
      );
    });

    return actions;
  }

  async initWaterfall() {
    this.isLoading$.next(true);

    const isProducer = await this.waterfallPermissionsService.hasRole(this.waterfall.id, 'producer');

    if (!isProducer) {
      this.snackbar.open('Only user with producer role can initialize waterfall', 'close', { duration: 5000 });
      this.isLoading$.next(false);
      return;
    }

    const actions = await this.getActions();

    const [init] = await Promise.all([
      this.blockService.create(this.waterfall.id, 'init', actions),
      this.waterfallService.addVersion(this.waterfall, { id: 'version_1', description: 'First Version' })
    ]);

    this.waterfall = await this.waterfallService.addBlocksToVersion(this.waterfall, 'version_1', [init]);

    await this.loadWaterfall();
  }
}
