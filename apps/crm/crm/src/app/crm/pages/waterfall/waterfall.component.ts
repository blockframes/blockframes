import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExpenseService } from '@blockframes/contract/expense/service';
import { IncomeService } from '@blockframes/contract/income/service';
import {
  Action,
  Expense,
  Income,
  Movie,
  PricePerCurrency,
  Term,
  Territory,
  Version,
  Waterfall,
  WaterfallContract,
  WaterfallDocument,
  WaterfallSource,
  convertDocumentTo,
  createVersion,
  getAssociatedSource,
  getContractAndAmendments,
  getCurrentContract,
  getDeclaredAmount,
  isContract
} from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
import { WaterfallDocumentsService } from '@blockframes/waterfall/documents.service';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';
import { where } from 'firebase/firestore';
import { DetailedTermsComponent } from '@blockframes/contract/term/components/detailed/detailed.component';
import { MatDialog } from '@angular/material/dialog';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { TermService } from '@blockframes/contract/term/service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BlockService } from '@blockframes/waterfall/block.service';

@Component({
  selector: 'crm-waterfall',
  templateUrl: './waterfall.component.html',
  styleUrls: ['./waterfall.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallComponent implements OnInit {
  public movie: Movie;
  public waterfall: Waterfall;
  public documents: WaterfallDocument[] = [];
  public incomes: Income[] = [];
  public expenses: Expense[] = [];
  public sources: WaterfallSource[] = [];
  public contracts: WaterfallContract[] = [];
  public versions: Version[] = [];
  public actions: (Action & { blockId: string })[] = [];
  private terms: Term[] = [];

  constructor(
    private movieService: MovieService,
    private waterfallService: WaterfallService,
    private waterfalllDocumentService: WaterfallDocumentsService,
    private incomeService: IncomeService,
    private expenseService: ExpenseService,
    private termService: TermService,
    private blockService: BlockService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,
    private cdRef: ChangeDetectorRef,
  ) { }

  async ngOnInit() {
    const waterfallId = this.route.snapshot.paramMap.get('waterfallId');
    this.movie = await this.movieService.getValue(waterfallId);
    this.waterfall = await this.waterfallService.getValue(waterfallId);
    this.sources = this.waterfall.sources;
    this.versions = this.waterfall.versions;
    this.documents = await this.waterfalllDocumentService.getValue({ waterfallId });

    this.contracts = this.documents.filter(d => isContract(d)).map(c => convertDocumentTo<WaterfallContract>(c));
    this.terms = (await Promise.all(this.contracts.map(c => this.termService.getValue([where('contractId', '==', c.id)])))).flat();

    this.incomes = await this.incomeService.getValue([where('titleId', '==', this.waterfall.id)]);
    this.expenses = await this.expenseService.getValue([where('titleId', '==', this.waterfall.id)]);

    this.cdRef.markForCheck();
  }

  public goToDocument(id: string) {
    // TODO #9420 this.router.navigate([id, 'map'], { relativeTo: this.route });
  }

  public getAssociatedSource(income: Income) {
    return getAssociatedSource(income, this.waterfall.sources).name;
  }

  public getCurrentContract(item: Income | Expense) {
    const contracts = getContractAndAmendments(item.contractId, this.contracts);
    const current = getCurrentContract(contracts, item.date);
    return current.rootId ? `${current.id} (${current.rootId})` : current.id;
  }

  public openTerritoryModal(territories: Territory[]) {
    this.dialog.open(DetailedTermsComponent, {
      data: createModalData({ terms: territories, scope: 'territories' }),
      autoFocus: false
    });
  }

  public getDeclaredAmount(contract: WaterfallContract) {
    return getDeclaredAmount({ ...contract, terms: this.terms.filter(t => t.contractId === contract.id) });
  }

  public getPrice(item: Income | Expense): PricePerCurrency {
    return { [item.currency]: item.price };
  }

  public async removeVersion(id: string) {
    this.waterfall.versions = this.waterfall.versions.filter(v => v.id !== id);
    await this.waterfallService.update(this.waterfall);
    this.waterfall = await this.waterfallService.getValue(this.waterfall.id);
    this.versions = this.waterfall.versions;
    this.snackBar.open(`Version "${id}" deleted from waterfall !`, 'close', { duration: 5000 });
    this.cdRef.markForCheck();
  }

  public async duplicateVersion(id: string) {
    const version = this.waterfall.versions.find(v => v.id === id);
    const blocks = await this.blockService.getValue(version.blockIds, { waterfallId: this.waterfall.id });

    const newVersion = createVersion({ 
      ...version, 
      id: `${version.id}-copy`, 
      name: `${version.name} (copy)`,
      blockIds: [],
      description: `Copied from ${version.id}`
    });
    await this.waterfallService.addVersion(this.waterfall, newVersion);

    const blocksIds = await Promise.all(blocks.map(b => this.blockService.create(this.waterfall.id, 'init', Object.values(b.actions))));

    await this.waterfallService.addBlocksToVersion(this.waterfall, newVersion.id, blocksIds);

    this.waterfall = await this.waterfallService.getValue(this.waterfall.id);
    this.versions = this.waterfall.versions;

    this.snackBar.open(`Version "${newVersion.id}" copied from ${version.id} !`, 'close', { duration: 5000 });
    this.cdRef.markForCheck();
  }

  public async displayActions(id: string) {
    this.snackBar.open(`Loading actions for version "${id}`, 'close', { duration: 5000 });
    const version = this.waterfall.versions.find(v => v.id === id);
    const blocks = await this.blockService.getValue(version.blockIds, { waterfallId: this.waterfall.id });

    this.actions = blocks.map(b => Object.values(b.actions).map(a => ({ ...a, blockId: b.id }))).flat();
    this.snackBar.open('Actions Loaded', 'close', { duration: 2000 });
    this.cdRef.markForCheck();
  }

}
