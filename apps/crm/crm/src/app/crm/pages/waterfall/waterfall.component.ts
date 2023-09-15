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
  groupByDate,
  ActionName,
  statementsToActions,
  Statement,
} from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
import { WaterfallDocumentsService } from '@blockframes/waterfall/documents.service';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';
import { where } from 'firebase/firestore';
import { DetailedGroupComponent } from '@blockframes/ui/detail-modal/detailed.component';
import { MatDialog } from '@angular/material/dialog';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { TermService } from '@blockframes/contract/term/service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BlockService } from '@blockframes/waterfall/block.service';
import { RightService } from '@blockframes/waterfall/right.service';
import { StatementService } from '@blockframes/waterfall/statement.service';
import { BehaviorSubject } from 'rxjs';

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
  public statements: Statement[] = [];
  public tree: { state: TitleState; history: History[] };
  private blocks: Block[] = [];
  private terms: Term[] = [];
  public canInitWaterfall$ = new BehaviorSubject(false);

  constructor(
    private movieService: MovieService,
    private waterfallService: WaterfallService,
    private waterfalllDocumentService: WaterfallDocumentsService,
    private incomeService: IncomeService,
    private expenseService: ExpenseService,
    private termService: TermService,
    private blockService: BlockService,
    private rightService: RightService,
    private statementService: StatementService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdRef: ChangeDetectorRef,
    private router: Router
  ) { }

  async ngOnInit() {
    await this.loadAll();
  }

  public async loadAll() {
    const waterfallId = this.route.snapshot.paramMap.get('waterfallId');
    const [movie, waterfall, documents, blocks, rights, incomes, expenses, statements] = await Promise.all([
      this.movieService.getValue(waterfallId),
      this.waterfallService.getValue(waterfallId),
      this.waterfalllDocumentService.getValue({ waterfallId }),
      this.blockService.getValue({ waterfallId }),
      this.rightService.getValue({ waterfallId }),
      this.incomeService.getValue([where('titleId', '==', waterfallId)]),
      this.expenseService.getValue([where('titleId', '==', waterfallId)]),
      this.statementService.fixtures(waterfallId)
    ]);

    this.movie = movie;
    this.waterfall = waterfall;
    this.sources = this.waterfall.sources;
    this.versions = this.waterfall.versions;
    this.rightholders = this.waterfall.rightholders;
    this.documents = documents;
    this.blocks = blocks;
    this.rights = rights;

    this.contracts = this.documents.filter(d => isContract(d)).map(c => convertDocumentTo<WaterfallContract>(c));
    this.terms = (await Promise.all(this.contracts.map(c => this.termService.getValue([where('contractId', '==', c.id)])))).flat();

    this.incomes = incomes;
    this.expenses = expenses;
    this.statements = statements;

    this.cdRef.markForCheck();
    this.canInitWaterfall$.next(this.canInitWaterfall());
  }

  public goToDocument(id: string) {
    this.router.navigate(['document', id], { relativeTo: this.route });
  }

  public getRightholderName(id: string) {
    if (!id) return '--';
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

  public getCurrentContract(item: Income | Expense) {
    const contracts = getContractAndAmendments(item.contractId, this.contracts);
    const current = getCurrentContract(contracts, item.date);
    if (!current) return '--';
    return current.rootId ? `${current.id} (${current.rootId})` : current.id;
  }

  public openTerritoryModal(territories: Territory[]) {
    this.dialog.open(DetailedGroupComponent, {
      data: createModalData({ items: territories, scope: 'territories' }),
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

    this.snackBar.open(`Creating version "${newVersion.id}" from "${version.id}"... Please wait`, 'close');

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

  public async removeDocuments(documents: (WaterfallDocument | WaterfallContract)[]) {
    const promises = documents.map(document => this.waterfalllDocumentService.remove(document.id, { params: { waterfallId: this.waterfall.id } }));
    await Promise.all(promises);
    this.documents = await this.waterfalllDocumentService.getValue({ waterfallId: this.waterfall.id });
    this.contracts = this.documents.filter(d => isContract(d)).map(c => convertDocumentTo<WaterfallContract>(c));
    this.snackBar.open(`Document${documents.length > 1 ? 's' : ''} ${documents.length === 1 ? documents[0].id : ''} deleted from waterfall !`, 'close', { duration: 5000 });
    this.cdRef.markForCheck();
  }

  public async removeRights(rights: Right[]) {
    const promises = rights.map(right => this.rightService.remove(right.id, { params: { waterfallId: this.waterfall.id } }));
    await Promise.all(promises);
    this.rights = await this.rightService.getValue({ waterfallId: this.waterfall.id });
    this.snackBar.open(`Right${rights.length > 1 ? 's' : ''} ${rights.length === 1 ? rights[0].id : ''} deleted from waterfall !`, 'close', { duration: 5000 });
    this.cdRef.markForCheck();
  }

  public async removeSources(sources: WaterfallSource[]) {
    await this.waterfallService.removeSources(this.waterfall.id, sources.map(s => s.id));
    this.waterfall = await this.waterfallService.getValue(this.waterfall.id);
    this.sources = this.waterfall.sources;
    this.snackBar.open(`Source${sources.length > 1 ? 's' : ''} ${sources.length === 1 ? sources[0].id : ''} deleted from waterfall !`, 'close', { duration: 5000 });
    this.cdRef.markForCheck();
  }

  public async removeRightholders(rightholders: WaterfallRightholder[]) {
    await this.waterfallService.removeRightholders(this.waterfall.id, rightholders.map(s => s.id));
    this.waterfall = await this.waterfallService.getValue(this.waterfall.id);
    this.rightholders = this.waterfall.rightholders;
    this.snackBar.open(`Rightholder${rightholders.length > 1 ? 's' : ''} ${rightholders.length === 1 ? rightholders[0].id : ''} deleted from waterfall !`, 'close', { duration: 5000 });
    this.cdRef.markForCheck();
  }

  public async removeIncomes(incomes: Income[]) {
    const promises = incomes.map(income => this.incomeService.remove(income.id));
    await Promise.all(promises);
    this.incomes = await this.incomeService.getValue([where('titleId', '==', this.waterfall.id)]);
    this.snackBar.open(`Income${incomes.length > 1 ? 's' : ''} ${incomes.length === 1 ? incomes[0].id : ''} deleted from waterfall !`, 'close', { duration: 5000 });
    this.cdRef.markForCheck();
  }

  public async removeExpenses(expenses: Expense[]) {
    const promises = expenses.map(expense => this.expenseService.remove(expense.id));
    await Promise.all(promises);
    this.expenses = await this.expenseService.getValue([where('titleId', '==', this.waterfall.id)]);
    this.snackBar.open(`Expense${expenses.length > 1 ? 's' : ''} ${expenses.length === 1 ? expenses[0].id : ''} deleted from waterfall !`, 'close', { duration: 5000 });
    this.cdRef.markForCheck();
  }

  public rightExists(id: string) {
    return this.rights.find(r => r.id === id);
  }

  public canInitWaterfall() {
    if (!this.contracts.length) return false;
    if (!this.sources.length) return false;
    if (!this.rights.length) return false;
    return this.hasMinimalRights();
  }

  public async initWaterfall() {
    await this.loadAll();
    if (!this.canInitWaterfall()) {
      this.snackBar.open('Missing required data to create waterfall', 'close', { duration: 5000 });
      return;
    }

    const versionNumber = this.waterfall.versions.length + 1;
    const versionId = `version_${versionNumber}`;
    this.snackBar.open(`Creating version "${versionId}"... Please wait`, 'close');

    const contractActions = contractsToActions(this.contracts, this.terms);
    const rightActions = rightsToActions(this.rights);
    const incomeActions = incomesToActions(this.contracts, this.incomes, this.sources);
    const expenseActions = expensesToActions(this.contracts, this.expenses);
    const paymentActions = statementsToActions(this.statements);

    const groupedActions = groupByDate([
      ...contractActions,
      ...rightActions,
      ...expenseActions, // Expenses should be added before incomes
      ...incomeActions,
      ...paymentActions
    ]);

    const blocks = await Promise.all(groupedActions.map(group => {
      const blockName = getBlockName(group.date, group.actions);
      return this.blockService.create(this.waterfall.id, blockName, group.actions);
    }));

    await this.waterfallService.addVersion(this.waterfall, { id: versionId, description: `Version ${versionNumber}` });

    this.waterfall = await this.waterfallService.addBlocksToVersion(this.waterfall, versionId, blocks);

    await this.loadAll();

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
  const dateStr = `${date.toLocaleDateString()}`;
  const actionsNames = Array.from(new Set(actions.map(a => a.name)));

  const statementsActions: ActionName[] = ['expense', 'income'];
  const contractsActions: ActionName[] = ['contract', 'updateContract'];
  const rightsActions: ActionName[] = ['append', 'prepend', 'prependHorizontal', 'appendHorizontal', 'appendVertical', 'prependVertical'];
  const paymentActions: ActionName[] = ['payment'];

  if (actionsNames.every(n => statementsActions.includes(n))) return `statements-${dateStr}`;
  if (actionsNames.every(n => contractsActions.includes(n))) return `contracts-${dateStr}`;
  if (actionsNames.every(n => rightsActions.includes(n))) return `rights-${dateStr}`;
  if (actionsNames.every(n => paymentActions.includes(n))) return `payments-${dateStr}`;
  return `mixed-${dateStr}`;
}