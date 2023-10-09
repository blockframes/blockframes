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
  getAssociatedSource,
  getContractAndAmendments,
  getCurrentContract,
  getDeclaredAmount,
  isContract,
  mainCurrency,
  Block,
  Right,
  Statement,
} from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
import { WaterfallDocumentsService } from '@blockframes/waterfall/documents.service';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';
import { where } from 'firebase/firestore';
import { DetailedGroupComponent } from '@blockframes/ui/detail-modal/detailed.component';
import { MatDialog } from '@angular/material/dialog';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RightService } from '@blockframes/waterfall/right.service';
import { StatementService } from '@blockframes/waterfall/statement.service';
import { BehaviorSubject } from 'rxjs';
import { unique } from '@blockframes/utils/helpers';

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
    private waterfallDocumentService: WaterfallDocumentsService,
    private incomeService: IncomeService,
    private expenseService: ExpenseService,
    private rightService: RightService,
    private statementService: StatementService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdRef: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit() { return this.loadAll(); }

  public async loadAll() {
    const waterfallId = this.route.snapshot.paramMap.get('waterfallId');

    const data = await this.waterfallService.loadWaterfalldata(waterfallId);
    this.movie = await this.movieService.getValue(waterfallId);
    this.waterfall = data.waterfall;
    this.sources = this.waterfall.sources;
    this.versions = this.waterfall.versions;
    this.rightholders = this.waterfall.rightholders;
    this.documents = data.documents;
    this.blocks = data.blocks;
    this.rights = data.rights;
    this.contracts = data.contracts;
    this.terms = data.terms
    this.incomes = data.incomes;
    this.expenses = data.expenses;
    this.statements = data.statements;

    this.cdRef.markForCheck();
    this.canInitWaterfall$.next(this.canInitWaterfall());
  }

  public goTo(type: 'document' | 'statement', id: string) {
    this.router.navigate([type, id], { relativeTo: this.route });
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
      return getAssociatedSource(income, this.waterfall.sources).name;
    } catch (error) {
      if (this.snackBar._openedSnackBarRef === null) this.snackBar.open(error, 'close', { duration: 5000 });
    }
  }

  public getCurrentContract(item: Income | Expense) { // TODO #9493 add Statement type
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
    await this.waterfallService.removeVersion(this.waterfall.id, id);
    this.actions = [];
    this.tree = undefined;
    await this.loadAll();
    this.snackBar.open(`Version "${id}" deleted from waterfall !`, 'close', { duration: 5000 });
  }

  public async duplicateVersion(id: string) {
    this.snackBar.open(`Creating version  from "${id}"... Please wait`, 'close');
    try {
      const newVersion = await this.waterfallService.duplicateVersion(this.waterfall.id, id);
      await this.loadAll();
      this.snackBar.open(`Version "${newVersion.id}" copied from ${id} !`, 'close', { duration: 5000 });
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 5000 });
    }
  }

  public async displayActions(id: string) {
    this.snackBar.open(`Loading actions for version "${id}`, 'close', { duration: 5000 });
    const version = this.waterfall.versions.find(v => v.id === id);
    const blocks = version.blockIds.map(blockId => this.blocks.find(b => b.id === blockId));

    this.actions = blocks.map(b => Object.values(b.actions).map(a => ({ ...a, blockId: b.id }))).flat();
    this.tree = undefined;
    this.snackBar.open('Actions Loaded', 'close', { duration: 2000 });
    this.cdRef.markForCheck();
  }

  public hasMinimalRights() {
    if (!this.sources.length) return false;
    const destinationRightIds = unique(this.sources.map(s => s.destinationId));
    return destinationRightIds.every(id => this.rights.map(r => r.id).includes(id));
  }

  public async removeDocuments(documents: (WaterfallDocument | WaterfallContract)[]) {
    const promises = documents.map(document => this.waterfallDocumentService.remove(document.id, { params: { waterfallId: this.waterfall.id } }));
    await Promise.all(promises);
    this.documents = await this.waterfallDocumentService.getValue({ waterfallId: this.waterfall.id });
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

  public async removeStatements(statements: Statement[]) {
    const promises = statements.map(statement => this.statementService.remove(statement.id, { params: { waterfallId: this.waterfall.id } }));
    await Promise.all(promises);
    this.statements = await this.statementService.getValue({ waterfallId: this.waterfall.id });
    this.snackBar.open(`Statement${statements.length > 1 ? 's' : ''} ${statements.length === 1 ? statements[0].id : ''} deleted from waterfall !`, 'close', { duration: 5000 });
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

    await this.waterfallService.initWaterfall(this.waterfall.id, { id: versionId, description: `Version ${versionNumber}` });
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

  public getPayloadPair(from: string | { org?: string, income?: string, right?: string }) {
    if (!from) return '--';
    if (typeof from === 'string') return from;

    if (from?.org) return this.getRightholderName(from.org);
    if (from?.income) return from.income;
    if (from?.right) return from.right;
  }

}