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
  Movie,
  PricePerCurrency,
  ProducerStatement,
  Right,
  RightholderRole,
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
  pathExists
} from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
import { unique } from '@blockframes/utils/helpers';
import { StatementService } from '@blockframes/waterfall/statement.service';
import { WaterfallService, WaterfallState } from '@blockframes/waterfall/waterfall.service';
import { add } from 'date-fns';

interface RightholderStatements {
  rightholderId: string,
  pending: ProducerStatement[],
  existing: ProducerStatement[]
}

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
  private statements: Statement[];
  public rightholderStatements: RightholderStatements;
  public contracts: WaterfallContract[] = [];
  private rights: Right[];
  private incomes: Income[];
  private state: WaterfallState;
  public currentState: History;
  public currentBlock: string;
  public producersOrCoproducers: WaterfallRightholder[] = [];

  constructor(
    private movieService: MovieService,
    private waterfallService: WaterfallService,
    private statementService: StatementService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  async ngOnInit() {
    const waterfallId = this.route.snapshot.paramMap.get('waterfallId');
    const versionId = this.route.snapshot.paramMap.get('versionId');
    const data = await this.waterfallService.loadWaterfalldata(waterfallId);
    this.movie = await this.movieService.getValue(waterfallId);

    this.waterfall = data.waterfall;
    this.statements = data.statements;
    this.contracts = data.contracts;
    this.rights = data.rights;
    this.incomes = data.incomes;

    this.snackBar.open('Waterfall is loading. Please wait', 'close', { duration: 5000 });
    this.state = await this.waterfallService.buildWaterfall({ waterfallId, versionId });
    this.history = this.state.waterfall.history;
    this.version = this.state.version;
    this.blocks = this.version.blockIds.map(id => data.blocks.find(b => b.id === id));
    this.currentBlock = this.blocks[this.blocks.length - 1].id;
    this.selectBlock(this.currentBlock);

    this.snackBar.open('Waterfall loaded !', 'close', { duration: 5000 });

    this.cdRef.markForCheck();
  }

  public selectBlock(blockId: string) {
    const index = this.version.blockIds.indexOf(blockId);
    this.currentState = this.history[index + 1]; // First history entry is always empty (init)
    this.rightholderStatements = undefined;
    this.producersOrCoproducers = Object.values(this.currentState.orgs)
      .map(({ id }) => this.getRightholder(id))
      .filter(({ roles }) => roles.includes('producer') || roles.includes('coProducer'));

    if (!this.producersOrCoproducers.length) this.snackBar.open('No producers or coproducers found for this waterfall', 'close', { duration: 5000 });
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

  public getRightholder(id: string) {
    return this.waterfall.rightholders.find(r => r.id === id);
  }

  public getRightholderName(id: string) {
    if (!id) return '--';
    return this.getRightholder(id)?.name || '--';
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

    // Fetch existing statements for this rightholder
    const existingStatements = this.statements.filter(s => s.rightholderId === rightholderId && isProducerStatement(s)) as ProducerStatement[];

    // Fetch active distributor statements where rightholder has received payments
    const distributorStatements = this.statements
      .filter(s => isDistributorStatement(s) && s.payments.rightholder)
      .filter(s => s.duration.to.getTime() <= currentStateDate.getTime())
      .filter((s: DistributorStatement) => s.payments.rightholder.to === rightholderId && s.payments.rightholder.status === 'received') as DistributorStatement[];

    // Fetch active direct sales statements created by the rightholder
    const directSalesStatements = this.statements
      .filter(s => isDirectSalesStatement(s))
      .filter(s => s.duration.to.getTime() <= currentStateDate.getTime())
      .filter(s => s.rightholderId === rightholderId) as DirectSalesStatement[];

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
      .filter(c => {
        // Remove contracts where the other party is a distributor
        const otherParty = c.sellerId === rightholderId ? c.buyerId : c.sellerId;
        const rightholder = this.waterfall.rightholders.find(r => r.id === otherParty);
        const distributorRoles: RightholderRole[] = ['mainDistributor', 'localDistributor', 'salesAgent'];
        return !rightholder.roles.some(r => distributorRoles.includes(r));
      });

    // Fetch incomes and sources related to the statements
    const distributorStatementsIncomeIds = distributorStatements.map(s => s.payments.rightholder.incomeIds).flat();
    const directSalesStatementsIncomeIds = directSalesStatements.map(s => s.incomeIds).flat();
    const incomeIds = unique([...distributorStatementsIncomeIds, ...directSalesStatementsIncomeIds]);
    const sources = this.getIncomesSources(incomeIds);

    // Filter contracts that have at least one right that is related to the sources
    const filteredContracts = contracts.filter(c => {
      const otherParty = c.sellerId === rightholderId ? c.buyerId : c.sellerId;
      const rights = this.rights.filter(r => r.rightholderId === otherParty);
      return rights.some(r => sources.some(s => pathExists(r.id, s.id, this.state.waterfall.state)));
    });

    const rightholder = this.waterfall.rightholders.find(r => r.id === rightholderId);
    return filteredContracts.map(c => createProducerStatement({
      id: this.statementService.createId(),
      type: rightholder.roles.includes('producer') ? 'producer' : 'coProducer',
      contractId: c.id,
      rightholderId,
      waterfallId: this.waterfall.id,
      incomeIds: incomeIds.filter(id => {
        // Filter incomes again to keep only incomes that are related to this contract
        const income = this.incomes.find(i => i.id === id);
        const source = getAssociatedSource(income, this.waterfall.sources);
        const otherParty = c.sellerId === rightholderId ? c.buyerId : c.sellerId;
        const rights = this.rights.filter(r => r.rightholderId === otherParty);
        return rights.some(r => pathExists(r.id, source.id, this.state.waterfall.state));
      }),
      duration: createDuration({
        from: add(currentStateDate, { days: 1 }),
        to: add(currentStateDate, { days: 1, months: 6 }),
      })
    })).filter(s => !existingStatements.find(e =>
      e.contractId === s.contractId
      && e.duration.from.getTime() === s.duration.from.getTime()
    ));
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

}