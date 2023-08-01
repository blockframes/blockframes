import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  TitleState,
  History,
  Version,
  Waterfall,
  WaterfallContract,
  WaterfallDocument,
  WaterfallRightholder,
  WaterfallSource,
  convertDocumentTo,
  createVersion,
  getAssociatedSource,
  getContractAndAmendments,
  getCurrentContract,
  getDeclaredAmount,
  isContract,
  mainCurrency,
  Block,
  Right,
  contractsToActions,
  rightsToActions,
  incomesToActions,
  expensesToActions,
  groupByDate
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
import { RightService } from '@blockframes/waterfall/right.service';

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
  public rightholders: WaterfallRightholder[] = [];
  public rights: Right[] = [];
  public tree: { state: TitleState; history: History[] };
  private blocks: Block[] = [];
  private terms: Term[] = [];

  constructor(
    private movieService: MovieService,
    private waterfallService: WaterfallService,
    private waterfalllDocumentService: WaterfallDocumentsService,
    private incomeService: IncomeService,
    private expenseService: ExpenseService,
    private termService: TermService,
    private blockService: BlockService,
    private rightService: RightService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdRef: ChangeDetectorRef,
  ) { }

  async ngOnInit() {
    const waterfallId = this.route.snapshot.paramMap.get('waterfallId');
    this.movie = await this.movieService.getValue(waterfallId);
    this.waterfall = await this.waterfallService.getValue(waterfallId);
    this.sources = this.waterfall.sources;
    this.versions = this.waterfall.versions;
    this.rightholders = this.waterfall.rightholders;
    this.documents = await this.waterfalllDocumentService.getValue({ waterfallId });
    this.blocks = await this.blockService.getValue({ waterfallId });
    this.rights = await this.rightService.getValue({ waterfallId });

    this.contracts = this.documents.filter(d => isContract(d)).map(c => convertDocumentTo<WaterfallContract>(c));
    this.terms = (await Promise.all(this.contracts.map(c => this.termService.getValue([where('contractId', '==', c.id)])))).flat();

    this.incomes = await this.incomeService.getValue([where('titleId', '==', this.waterfall.id)]);
    this.expenses = await this.expenseService.getValue([where('titleId', '==', this.waterfall.id)]);

    this.cdRef.markForCheck();
  }

  public goToDocument(id: string) {
    // TODO #9420 this.router.navigate([id, 'map'], { relativeTo: this.route });
  }

  public getRightholderName(id: string) {
    return this.waterfall.rightholders.find(r => r.id === id)?.name || '--';
  }

  public getBlockName(id: string) {
    return this.blocks.find(b => b.id === id).name;
  }

  public getAssociatedSource(income: Income) {
    try {
      return getAssociatedSource(income, this.waterfall.sources)?.name || '--';
    } catch (error) {
      if (this.snackBar._openedSnackBarRef === null) this.snackBar.open(error, 'close', { duration: 5000 });
    }
  }

  public async removeSource(id: string) {
    await this.waterfallService.removeSource(this.waterfall.id, id);
    this.waterfall = await this.waterfallService.getValue(this.waterfall.id);
    this.sources = this.waterfall.sources;
    this.snackBar.open(`Source "${id}" deleted from waterfall !`, 'close', { duration: 5000 });
    this.cdRef.markForCheck();
  }

  public getCurrentContract(item: Income | Expense) {
    const contracts = getContractAndAmendments(item.contractId, this.contracts);
    const current = getCurrentContract(contracts, item.date);
    if (!current) return '--';
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

  public toPricePerCurrency(item: Income | Expense): PricePerCurrency {
    return { [item.currency]: item.price };
  }

  public getPrice(amount: number): PricePerCurrency {
    return { [mainCurrency]: amount };
  }

  public async removeDocument(id: string) {
    await this.waterfalllDocumentService.remove(id, { params: { waterfallId: this.waterfall.id } });
    this.documents = await this.waterfalllDocumentService.getValue({ waterfallId: this.waterfall.id });
    this.contracts = this.documents.filter(d => isContract(d)).map(c => convertDocumentTo<WaterfallContract>(c));
    this.snackBar.open(`Document "${id}" deleted from waterfall !`, 'close', { duration: 5000 });
    this.cdRef.markForCheck();
  }

  public async removeVersion(id: string) {
    this.waterfall.versions = this.waterfall.versions.filter(v => v.id !== id);
    await this.waterfallService.update(this.waterfall);
    this.waterfall = await this.waterfallService.getValue(this.waterfall.id);
    this.versions = this.waterfall.versions;
    this.actions = [];
    this.tree = undefined;
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
    this.tree = undefined;
    this.snackBar.open('Actions Loaded', 'close', { duration: 2000 });
    this.cdRef.markForCheck();
  }

  public hasMinimalRights() {
    if (!this.sources.length) return false;
    const destinationRightIds = Array.from(new Set(this.sources.map(s => s.destinationId)));
    return destinationRightIds.every(id => this.rights.map(r => r.id).includes(id));
  }


  public async removeRight(id: string) {
    await this.rightService.remove(id, { params: { waterfallId: this.waterfall.id } });
    this.rights = await this.rightService.getValue({ waterfallId: this.waterfall.id });
    this.snackBar.open(`Right "${id}" deleted from waterfall !`, 'close', { duration: 5000 });
    this.cdRef.markForCheck();
  }

  public async removeIncome(id: string) {
    await this.incomeService.remove(id);
    this.incomes = await this.incomeService.getValue([where('titleId', '==', this.waterfall.id)]);
    this.snackBar.open(`Income "${id}" deleted from waterfall !`, 'close', { duration: 5000 });
    this.cdRef.markForCheck();
  }

  public rightExists(id: string) {
    return this.rights.find(r => r.id === id);
  }

  public canInitWaterfall() {
    if (!this.contracts.length) return false;
    if (!this.sources.length) return false;
    if (!this.rights.length) return false;
    if (!this.incomes.length) return false;
    if (!this.expenses.length) return false;
    return this.hasMinimalRights();
  }

  public async initWaterfall() {
    const versionId = 'version_1';

    // TODO #9420 actionId generated by action() will be erased by createAction() in this.blockService.create()
    const contractActions = contractsToActions(this.contracts, this.terms);
    const rightActions = rightsToActions(this.rights);
    const incomeActions = incomesToActions(this.contracts, this.incomes, this.sources);
    const expenseActions = expensesToActions(this.contracts, this.expenses);

    const groupedActions = groupByDate([
      ...contractActions,
      ...rightActions,
      ...expenseActions, // Expenses should be added before incomes
      ...incomeActions
    ]);

    const blocks = await Promise.all(groupedActions.map(group => {
      const blockName = getBlockName(group.date, group.actions);
      return this.blockService.create(this.waterfall.id, blockName, group.actions);
    }));

    await this.waterfallService.addVersion(this.waterfall, { id: versionId, description: 'First Version' });

    this.waterfall = await this.waterfallService.addBlocksToVersion(this.waterfall, versionId, blocks);

    this.waterfall = await this.waterfallService.getValue(this.waterfall.id);
    this.versions = this.waterfall.versions;
    this.snackBar.open(`Version "${versionId}" initialized !`, 'close', { duration: 5000 });
    this.cdRef.markForCheck();
  }

  public async displayWaterfall(versionId: string) {
    this.snackBar.open('Waterfall is loading. Please wait', 'close', { duration: 5000 });
    const data = await this.waterfallService.buildWaterfall({ waterfallId: this.waterfall.id, versionId });
    this.tree = data.waterfall;
    this.actions = [];
    this.cdRef.markForCheck();
    this.snackBar.open('Waterfall loaded !', 'close', { duration: 5000 });
  }

}

function getBlockName(date: Date, actions: Action[]) {
  const dateStr = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  const actionsNames = Array.from(new Set(actions.map(a => a.name)));

  if (actionsNames.includes('expense') || actionsNames.includes('income')) return `statement-${dateStr}`;
  if (actionsNames.includes('contract') || actionsNames.includes('updateContract')) return `contracts-${dateStr}`;
  if (actionsNames.includes('append')) return `rights-${dateStr}`;
  return `mixed-${dateStr}`;
}