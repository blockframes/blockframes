import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Block,
  DirectSalesStatement,
  DistributorStatement,
  History,
  Income,
  IncomeState,
  PricePerCurrency,
  ProducerStatement,
  Right,
  Statement,
  Version,
  Waterfall,
  WaterfallContract,
  WaterfallRightholder,
  createDuration,
  createProducerStatement,
  getAssociatedSource,
  getContractAndAmendments,
  getCurrentContract,
  isDirectSalesStatement,
  isDistributorStatement,
  isProducerStatement,
  mainCurrency,
  movieCurrencies,
  pathExists,
  rightholderGroups
} from '@blockframes/model';
import { unique } from '@blockframes/utils/helpers';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';
import { StatementService } from '@blockframes/waterfall/statement.service';
import { WaterfallState } from '@blockframes/waterfall/waterfall.service';
import { add } from 'date-fns';
import { firstValueFrom } from 'rxjs';

interface RightholderStatements {
  rightholderId: string,
  pending: ProducerStatement[],
  existing: ProducerStatement[]
}

@Component({
  selector: 'crm-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  public waterfall: Waterfall;
  public version: Version;
  public statementBlocks: Block[];
  public history: History[];
  private statements: Statement[];
  public rightholderStatements: RightholderStatements;
  public contracts: WaterfallContract[] = [];
  private rights: Right[];
  private incomes: Income[];
  private state: WaterfallState;
  public currentState: History;
  public currentBlock: string;
  public producers: WaterfallRightholder[] = []; // TODO #9485 transform into single rightholder as there is only one producer per waterfall
  public options = { xAxis: { categories: [] }, series: [] };
  public formatter = { formatter: (value: number) => `${value} ${movieCurrencies[mainCurrency]}` };

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private statementService: StatementService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  async ngOnInit() {
    this.shell.setVersionId(this.route.snapshot.paramMap.get('versionId'));
    this.shell.setDate(undefined);

    this.waterfall = this.shell.waterfall;
    this.statements = await firstValueFrom(this.shell.statements$);
    this.contracts = await firstValueFrom(this.shell.contracts$);
    this.rights = await firstValueFrom(this.shell.rights$);
    this.incomes = await firstValueFrom(this.shell.incomes$);
    const blocks = await firstValueFrom(this.shell.blocks$);

    this.snackBar.open('Waterfall is loading. Please wait', 'close', { duration: 5000 });
    this.state = await firstValueFrom(this.shell.state$);
    this.history = this.state.waterfall.history;
    this.version = this.state.version;
    const versionBlocks = this.version.blockIds.map(id => blocks.find(b => b.id === id));
    this.statementBlocks = versionBlocks.filter(b => this.statements.find(s => s.duration.to.getTime() === b.timestamp));
    if (this.statementBlocks.length) {
      this.currentBlock = this.statementBlocks[this.statementBlocks.length - 1].id;
      this.selectBlock(this.currentBlock);
      if (!this.producers.length) {
        this.snackBar.open('No producer found for this waterfall. Please set rightholders roles.', 'close', { duration: 5000 });
      } else {
        this.snackBar.open('Waterfall loaded !', 'close', { duration: 5000 });
      }
    } else {
      this.snackBar.open('No statements found for this waterfall', 'close', { duration: 5000 });
    }

    this.cdRef.markForCheck();
  }

  public selectBlock(blockId: string) {
    const index = this.version.blockIds.indexOf(blockId);
    this.currentState = this.history[index + 1]; // First history entry is always empty (init)
    this.rightholderStatements = undefined;
    this.producers = Object.values(this.currentState.orgs)
      .map(({ id }) => this.getRightholder(id))
      .filter(({ roles }) => roles.includes('producer'));

    this.buildGraph(blockId);
    this.cdRef.markForCheck();
  }

  private buildGraph(blockId: string) {
    const filteredStatementBlocks = this.statementBlocks.filter(b => this.version.blockIds.indexOf(b.id) <= this.version.blockIds.indexOf(blockId));
    const data = filteredStatementBlocks.map(block => {
      const index = this.version.blockIds.indexOf(block.id);
      const state = this.history[index + 1];
      const incomes = Object.values(state.incomes).map(incomeState => {
        const income = this.incomes.find(i => i.id === incomeState.id);
        return { amount: incomeState.amount, source: getAssociatedSource(income, this.waterfall.sources) };
      });

      const incomesBySource = this.waterfall.sources.map(source => {
        const incomesForSource = incomes.filter(i => i.source.id === source.id);
        const amount = incomesForSource.length ? incomesForSource.map(i => i.amount).reduce((a, b) => a + b) : 0;
        return { source, amount: Math.round(amount) };
      });

      return { date: new Date(block.timestamp), incomesBySource };
    });

    const categories = data.map(h => new Date(h.date).toISOString().slice(0, 10));
    const sourcesWithIncome = this.waterfall.sources.filter(s => data.some(d => d.incomesBySource.some(i => i.source.id === s.id && i.amount > 0)));
    const series = sourcesWithIncome.map(source => ({
      name: source.name,
      data: data.map(d => d.incomesBySource.find(i => i.source.id === source.id).amount)
    }));

    this.options = { xAxis: { categories }, series };
  }

  public getTotalIncomes(incomeState: Record<string, IncomeState>): PricePerCurrency {
    const incomeStates = Object.values(incomeState);
    if (!incomeStates.length) return this.getPrice(0);
    return this.getPrice(incomeStates.map(a => a.amount).reduce((a, b) => a + b));
  }

  public getPrice(amount: number): PricePerCurrency {
    return { [mainCurrency]: amount };
  }

  public getRightholder(id: string) {
    return this.waterfall.rightholders.find(r => r.id === id);
  }

  public getCurrentContract(item: Statement) {
    if (isDistributorStatement(item) || isProducerStatement(item)) {
      const contracts = getContractAndAmendments(item.contractId, this.contracts);
      const current = getCurrentContract(contracts, item.duration.from);
      if (!current) return '--';
      return current.rootId ? `${current.id} (${current.rootId})` : current.id;
    }
    return '--';
  }

  public getPendingRevenue(rightholderId: string): PricePerCurrency {
    const pendingRevenue = this.statements
      .filter(s => (isDistributorStatement(s) || isProducerStatement(s)) && s.payments.rightholder)
      .filter((s: DistributorStatement | ProducerStatement) => s.payments.rightholder.to === rightholderId && s.payments.rightholder.status === 'pending')
      .map((s: DistributorStatement | ProducerStatement) => s.payments.rightholder);

    const pending: PricePerCurrency = {};
    pendingRevenue.forEach(i => {
      pending[i.currency] ||= 0;
      pending[i.currency] += i.price;
    });
    return pending;
  }

  public statementsToCreate(rightholderId: string) {
    const currentStateDate = new Date(this.currentState.date);

    // Fetch active distributor statements where rightholder has received payments
    const distributorStatements = this.statements
      .filter(s => isDistributorStatement(s) && s.payments.rightholder)
      .filter(s => s.duration.to.getTime() <= currentStateDate.getTime())
      .filter((s: DistributorStatement) => s.payments.rightholder.to === rightholderId && s.payments.rightholder.status === 'received') as DistributorStatement[];

    // Fetch active direct sales statements created by the rightholder
    const directSalesStatements = this.statements
      .filter(s => isDirectSalesStatement(s))
      .filter(s => s.duration.to.getTime() <= currentStateDate.getTime())
      .filter(s => s.rightholderId === rightholderId && s.status === 'reported') as DirectSalesStatement[];

    const statements = [...distributorStatements, ...directSalesStatements];
    if (!statements.length) return [];

    // Fetch contract ids that are related to the statements (remove amendments or root contracts)
    const excludedContractsIds = unique(distributorStatements.map(s => getContractAndAmendments(s.contractId, this.contracts).map(c => c.id)).flat());

    // Fetch current contracts where the rightholder is involved (buyer or seller) that are not in the excluded list
    const contractsIds = this.contracts.
      filter(c => (c.buyerId === rightholderId || c.sellerId === rightholderId) && !excludedContractsIds.find(id => id === c.id))
      .map(c => getCurrentContract(getContractAndAmendments(c.id, this.contracts), currentStateDate)?.id)
      .filter(c => !!c); // Remove contracts that are not active in the current state date

    const contracts = unique(contractsIds)
      .map(id => this.contracts.find(c => c.id === id))
      .filter(c => !Object.keys(rightholderGroups.distributors).includes(c.type));

    // Fetch incomes and sources related to the statements
    const distributorStatementsIncomeIds = distributorStatements.map(s => s.payments.rightholder.incomeIds).flat();
    const directSalesStatementsIncomeIds = directSalesStatements.map(s => s.incomeIds).flat();
    const incomeIds = unique([...distributorStatementsIncomeIds, ...directSalesStatementsIncomeIds]);
    const sources = this.getIncomesSources(incomeIds);

    // Filter contracts that have at least one right that is related to the sources
    const filteredContracts = contracts.filter(c => {
      const rights = this.rights.filter(r => r.contractId === c.id);
      return rights.some(r => sources.some(s => pathExists(r.id, s.id, this.state.waterfall.state)));
    });

    return filteredContracts.map(c => createProducerStatement({
      id: this.statementService.createId(),
      contractId: c.id,
      rightholderId,
      waterfallId: this.waterfall.id,
      incomeIds: incomeIds.filter(id => !this.statements // Remove incomes for which a statement already exists for this contract
        .filter(s => !isDirectSalesStatement(s))
        .filter((s: ProducerStatement | DistributorStatement) => s.contractId === c.id)
        .some(s => s.incomeIds.includes(id))
      ).filter(id => {
        // Filter incomes again to keep only incomes that are related to this contract
        const income = this.incomes.find(i => i.id === id);
        const source = getAssociatedSource(income, this.waterfall.sources);
        const rights = this.rights.filter(r => r.contractId === c.id);
        return rights.some(r => pathExists(r.id, source.id, this.state.waterfall.state));
      }),
      duration: createDuration({
        from: add(currentStateDate, { days: 1 }),
        to: add(currentStateDate, { days: 1, months: 6 }),
      })
    })).filter(s => s.incomeIds.length);
  }

  public getIncomesSources(incomeIds: string[]) {
    const incomes = this.incomes.filter(i => incomeIds.includes(i.id));
    return unique(incomes.map(i => getAssociatedSource(i, this.waterfall.sources)));
  }

  public displayRightholderStatements(rightholderId: string) {
    this.rightholderStatements = {
      rightholderId,
      pending: this.statementsToCreate(rightholderId),
      existing: this.statements.filter(s => s.rightholderId === rightholderId && isProducerStatement(s)) as ProducerStatement[]
    };
    this.cdRef.markForCheck();
  }

  public async createStatement(statement: Statement, redirect = true) {
    const id = await this.statementService.add(statement, { params: { waterfallId: this.waterfall.id } });
    if (redirect) return this.router.navigate(['/c/o/dashboard/crm/waterfall', this.waterfall.id, 'statement', id]);
    this.statements.push(statement);
    this.displayRightholderStatements(statement.rightholderId);
  }

  public goTo(type: 'statements' | 'rightholders', id: string) {
    this.router.navigate(['/c/o/dashboard/crm/waterfall', this.waterfall.id, type, id]);
  }
}